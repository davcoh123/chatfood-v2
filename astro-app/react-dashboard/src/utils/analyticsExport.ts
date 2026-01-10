import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface RevenueExportData {
  thisMonth: number;
  lastMonth: number;
  growth: number;
  weeklyAverage: number;
  weekly: Array<{ week: string; revenue: number; orders: number }>;
  byCategory: Array<{ name: string; revenue: number; percentage: number }>;
}

export interface OrdersExportData {
  thisMonth: number;
  growth: number;
  byDay: Array<{ day: string; orders: number; percentage: number }>;
  peakDay: string;
  peakHour: string;
}

export interface CustomersExportData {
  total: number;
  active: number;
  retentionRate: number;
  newThisMonth: number;
  segments: Array<{ type: string; count: number; averageSpend: number; revenuePercentage: number }>;
}

export interface ProductsExportData {
  top: Array<{ name: string; sales: number; revenue: number; category: string }>;
  totalSales: number;
}

export interface SatisfactionExportData {
  averageRating: number;
  totalReviews: number;
  distribution: Array<{ rating: string; count: number; percentage: number }>;
}

export interface AnalyticsExportData {
  revenue: RevenueExportData;
  orders: OrdersExportData;
  customers: CustomersExportData;
  products: ProductsExportData;
  satisfaction: SatisfactionExportData;
}

export async function exportAnalyticsPDF(data: AnalyticsExportData, restaurantName: string) {
  // Dynamic imports for heavy libraries
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const today = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr });
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text(`Rapport Analytics`, 14, 22);
  
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text(restaurantName, 14, 30);
  
  doc.setFontSize(10);
  doc.text(`Généré le ${today}`, 14, 38);
  
  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 42, pageWidth - 14, 42);
  
  let yPos = 50;
  
  // Section: Revenus
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('📊 Revenus', 14, yPos);
  yPos += 8;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Métrique', 'Valeur']],
    body: [
      ['Revenu ce mois', `€${data.revenue.thisMonth.toLocaleString('fr-FR')}`],
      ['Revenu mois dernier', `€${data.revenue.lastMonth.toLocaleString('fr-FR')}`],
      ['Croissance', `${data.revenue.growth >= 0 ? '+' : ''}${data.revenue.growth}%`],
      ['Revenu hebdomadaire moyen', `€${data.revenue.weeklyAverage.toLocaleString('fr-FR')}`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Section: Commandes
  doc.setFontSize(14);
  doc.text('🛒 Commandes', 14, yPos);
  yPos += 8;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Métrique', 'Valeur']],
    body: [
      ['Commandes ce mois', data.orders.thisMonth.toString()],
      ['Croissance', `${data.orders.growth >= 0 ? '+' : ''}${data.orders.growth}%`],
      ['Jour de pointe', data.orders.peakDay],
      ['Heure de pointe', data.orders.peakHour],
    ],
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    margin: { left: 14, right: 14 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Section: Clients
  doc.setFontSize(14);
  doc.text('👥 Clients', 14, yPos);
  yPos += 8;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Métrique', 'Valeur']],
    body: [
      ['Clients totaux', data.customers.total.toString()],
      ['Clients actifs (30j)', data.customers.active.toString()],
      ['Taux de rétention', `${data.customers.retentionRate}%`],
      ['Nouveaux ce mois', data.customers.newThisMonth.toString()],
    ],
    theme: 'striped',
    headStyles: { fillColor: [139, 92, 246] },
    margin: { left: 14, right: 14 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Check if we need a new page
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }
  
  // Section: Top Produits
  doc.setFontSize(14);
  doc.text('⭐ Top 5 Produits', 14, yPos);
  yPos += 8;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Produit', 'Ventes', 'Revenu', 'Catégorie']],
    body: data.products.top.slice(0, 5).map(p => [
      p.name,
      p.sales.toString(),
      `€${p.revenue.toLocaleString('fr-FR')}`,
      p.category,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22] },
    margin: { left: 14, right: 14 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Section: Satisfaction
  doc.setFontSize(14);
  doc.text('😊 Satisfaction Client', 14, yPos);
  yPos += 8;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Métrique', 'Valeur']],
    body: [
      ['Note moyenne', `${data.satisfaction.averageRating}/5`],
      ['Nombre d\'avis', data.satisfaction.totalReviews.toString()],
    ],
    theme: 'striped',
    headStyles: { fillColor: [236, 72, 153] },
    margin: { left: 14, right: 14 },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`analytics-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export async function exportAnalyticsExcel(data: AnalyticsExportData, restaurantName: string) {
  // Dynamic import for heavy library
  const XLSX = await import('xlsx');
  
  const wb = XLSX.utils.book_new();
  const today = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr });
  
  // Sheet 1: Résumé
  const summaryData = [
    ['Rapport Analytics', restaurantName],
    ['Généré le', today],
    [''],
    ['=== REVENUS ==='],
    ['Revenu ce mois', data.revenue.thisMonth],
    ['Revenu mois dernier', data.revenue.lastMonth],
    ['Croissance (%)', data.revenue.growth],
    ['Revenu hebdomadaire moyen', data.revenue.weeklyAverage],
    [''],
    ['=== COMMANDES ==='],
    ['Commandes ce mois', data.orders.thisMonth],
    ['Croissance (%)', data.orders.growth],
    ['Jour de pointe', data.orders.peakDay],
    ['Heure de pointe', data.orders.peakHour],
    [''],
    ['=== CLIENTS ==='],
    ['Clients totaux', data.customers.total],
    ['Clients actifs (30j)', data.customers.active],
    ['Taux de rétention (%)', data.customers.retentionRate],
    ['Nouveaux ce mois', data.customers.newThisMonth],
    [''],
    ['=== SATISFACTION ==='],
    ['Note moyenne', data.satisfaction.averageRating],
    ['Nombre d\'avis', data.satisfaction.totalReviews],
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Résumé');
  
  // Sheet 2: Revenus hebdomadaires
  const weeklyRevenueSheet = XLSX.utils.json_to_sheet(data.revenue.weekly);
  XLSX.utils.book_append_sheet(wb, weeklyRevenueSheet, 'Revenus Hebdo');
  
  // Sheet 3: Revenus par catégorie
  const categoryRevenueSheet = XLSX.utils.json_to_sheet(data.revenue.byCategory);
  XLSX.utils.book_append_sheet(wb, categoryRevenueSheet, 'Revenus Catégories');
  
  // Sheet 4: Commandes par jour
  const ordersByDaySheet = XLSX.utils.json_to_sheet(data.orders.byDay);
  XLSX.utils.book_append_sheet(wb, ordersByDaySheet, 'Commandes par Jour');
  
  // Sheet 5: Top produits
  const productsSheet = XLSX.utils.json_to_sheet(data.products.top);
  XLSX.utils.book_append_sheet(wb, productsSheet, 'Top Produits');
  
  // Sheet 6: Segments clients
  const segmentsSheet = XLSX.utils.json_to_sheet(data.customers.segments);
  XLSX.utils.book_append_sheet(wb, segmentsSheet, 'Segments Clients');
  
  // Sheet 7: Distribution des notes
  const ratingsSheet = XLSX.utils.json_to_sheet(data.satisfaction.distribution);
  XLSX.utils.book_append_sheet(wb, ratingsSheet, 'Distribution Notes');
  
  XLSX.writeFile(wb, `analytics-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}
