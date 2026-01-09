import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
  category: string;
  percentage: number;
}

interface SalesByCategory {
  category: string;
  sales: number;
  revenue: number;
}

// Palette de couleurs contrastées - pas de jaune clair
const CATEGORY_PALETTE = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber (contrasted)
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#14B8A6', // teal
  '#6366F1', // indigo
  '#84CC16', // lime
  '#D946EF', // fuchsia
  '#0EA5E9', // sky
  '#22C55E', // green
  '#A855F7', // purple
];

export function useProductsAnalytics() {
  const { user } = useAuth();

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['products-analytics-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('chatbot_orders')
        .select('id, commande_item, status')
        .eq('user_id', user.id)
        .in('status', ['delivered', 'ready', 'preparing', 'confirmed']);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: products } = useQuery({
    queryKey: ['products-list', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, unit_price')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Aggregate product sales
  const productSalesMap: Record<string, { sales: number; revenue: number; category: string }> = {};
  
  orders?.forEach(order => {
    const items = order.commande_item as any[];
    if (Array.isArray(items)) {
      items.forEach(item => {
        const product = products?.find(p => p.id === item.product_id || p.name === item.name);
        const productName = item.name || product?.name || 'Produit inconnu';
        
        // Get category from item first, then from product
        const category = item.category || product?.category;
        
        // Skip items without a valid category
        if (!category) return;
        
        const quantity = item.quantity || 1;
        const price = (item.unit_price || item.price || product?.unit_price || 0) * quantity;
        
        if (!productSalesMap[productName]) {
          productSalesMap[productName] = { sales: 0, revenue: 0, category };
        }
        productSalesMap[productName].sales += quantity;
        productSalesMap[productName].revenue += price;
      });
    }
  });

  const totalSales = Object.values(productSalesMap).reduce((sum, p) => sum + p.sales, 0) || 1;

  // Top products sorted by sales
  const topProducts: TopProduct[] = Object.entries(productSalesMap)
    .map(([name, data]) => ({
      name,
      sales: data.sales,
      revenue: Math.round(data.revenue),
      category: data.category,
      percentage: Math.round((data.sales / totalSales) * 100 * 10) / 10,
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10);

  // Best product
  const topProduct = topProducts[0] || { name: 'N/A', sales: 0, revenue: 0, category: 'N/A', percentage: 0 };

  // Sales by category
  const categorySalesMap: Record<string, { sales: number; revenue: number }> = {};
  
  Object.values(productSalesMap).forEach(product => {
    if (!categorySalesMap[product.category]) {
      categorySalesMap[product.category] = { sales: 0, revenue: 0 };
    }
    categorySalesMap[product.category].sales += product.sales;
    categorySalesMap[product.category].revenue += product.revenue;
  });

  const salesByCategory: SalesByCategory[] = Object.entries(categorySalesMap)
    .map(([category, data]) => ({
      category,
      sales: data.sales,
      revenue: Math.round(data.revenue),
    }))
    .sort((a, b) => b.sales - a.sales);

  // Générer les couleurs dynamiquement par index de catégorie
  const categoryColors: Record<string, string> = {};
  salesByCategory.forEach((cat, index) => {
    categoryColors[cat.category] = CATEGORY_PALETTE[index % CATEGORY_PALETTE.length];
  });

  return {
    isLoading: ordersLoading,
    topProducts,
    topProduct,
    salesByCategory,
    totalSales,
    categoryColors,
  };
}
