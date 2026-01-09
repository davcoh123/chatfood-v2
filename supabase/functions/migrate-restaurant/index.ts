import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Webhook URLs for fetching existing Google Sheets data
const WEBHOOKS = {
  CATALOG: 'https://n8n.chatfood.fr/webhook/recup-catalogue-wh230706997',
  ADDONS: 'https://n8n.chatfood.fr/webhook/recup-addons-wh230706997',
  MENUS: 'https://n8n.chatfood.fr/webhook/recup-menus-wh230706997',
};

interface MigrationRequest {
  restaurant_id: string;
  spreadsheet_id: string;
  sheet_ids: {
    catalog: number;
    cart: number;
    analytics_message: number;
    analytics_calendar: number;
    addons: number | null;
    menus: number | null;
  };
}

interface MigrationResult {
  success: boolean;
  migrated: {
    products: number;
    addons: number;
    menus: number;
  };
  errors: string[];
  warnings: string[];
  debug: {
    catalog_raw_sample?: unknown;
    addons_raw_sample?: unknown;
    menus_raw_sample?: unknown;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: MigrationRequest = await req.json();
    const { restaurant_id, spreadsheet_id, sheet_ids } = body;

    console.log(`Starting migration for restaurant: ${restaurant_id}`);
    console.log(`Spreadsheet ID: ${spreadsheet_id}`);
    console.log(`Sheet IDs:`, sheet_ids);

    const result: MigrationResult = {
      success: true,
      migrated: {
        products: 0,
        addons: 0,
        menus: 0,
      },
      errors: [],
      warnings: [],
      debug: {},
    };

    const payload = {
      spreadsheet_id,
      sheet_ids,
    };

    // =====================================================
    // 1. MIGRATE PRODUCTS (Catalog)
    // =====================================================
    try {
      console.log('Fetching products from Google Sheets...');
      const catalogResponse = await fetch(WEBHOOKS.CATALOG, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (catalogResponse.ok) {
        const rawText = await catalogResponse.text();
        console.log(`Catalog raw response (first 500 chars): ${rawText.substring(0, 500)}`);
        
        let products: unknown[];
        try {
          const parsed = JSON.parse(rawText);
          products = Array.isArray(parsed) ? parsed : [];
          
          if (products.length > 0) {
            result.debug.catalog_raw_sample = products[0];
          }
        } catch (parseErr) {
          console.error('Failed to parse catalog JSON:', parseErr);
          result.errors.push(`Catalog JSON parse error: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
          products = [];
        }
        
        console.log(`Parsed ${products.length} products`);

        if (products.length > 0) {
          for (const product of products) {
            const p = product as Record<string, unknown>;
            
            const productData = {
              user_id: restaurant_id,
              name: String(p.name || ''),
              description: p.description ? String(p.description) : null,
              category: String(p.category || 'Non classé'),
              ingredient: normalizeArray(p.ingredient),
              unit_price: parseFloat(String(p.unit_price)) || 0,
              currency: String(p.currency || 'EUR'),
              vat_rate: parseFloat(String(p.vat_rate)) || 10.00,
              is_active: normalizeBoolean(p.is_active),
              tags: normalizeArray(p.tags),
              allergens: normalizeArray(p.allergens),
            };

            if (!productData.name) {
              result.warnings.push(`Skipped product with empty name`);
              continue;
            }

            const { error } = await supabase
              .from('products')
              .insert(productData);

            if (error) {
              console.error(`Error inserting product ${productData.name}:`, error);
              result.errors.push(`Product ${productData.name}: ${error.message}`);
            } else {
              result.migrated.products++;
            }
          }
        } else {
          result.warnings.push('No products found in catalog response');
        }
      } else {
        const errorText = await catalogResponse.text();
        console.error('Failed to fetch catalog:', catalogResponse.status, errorText);
        result.errors.push(`Catalog fetch failed: ${catalogResponse.status} - ${errorText.substring(0, 200)}`);
      }
    } catch (err) {
      console.error('Error migrating products:', err);
      result.errors.push(`Products migration error: ${err instanceof Error ? err.message : String(err)}`);
    }

    // =====================================================
    // 2. MIGRATE ADDONS
    // =====================================================
    if (sheet_ids.addons) {
      try {
        console.log('Fetching addons from Google Sheets...');
        const addonsResponse = await fetch(WEBHOOKS.ADDONS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (addonsResponse.ok) {
          const rawText = await addonsResponse.text();
          console.log(`Addons raw response (first 500 chars): ${rawText.substring(0, 500)}`);
          
          let addons: unknown[];
          try {
            const parsed = JSON.parse(rawText);
            addons = Array.isArray(parsed) ? parsed : [];
            
            if (addons.length > 0) {
              result.debug.addons_raw_sample = addons[0];
            }
          } catch (parseErr) {
            console.error('Failed to parse addons JSON:', parseErr);
            result.errors.push(`Addons JSON parse error: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
            addons = [];
          }
          
          console.log(`Parsed ${addons.length} addons`);

          if (addons.length > 0) {
            for (const addon of addons) {
              const a = addon as Record<string, unknown>;
              
              const addonData = {
                user_id: restaurant_id,
                label: String(a.label || ''),
                price: parseFloat(String(a.price)) || 0,
                applies_to_type: String(a.applies_to_type || 'global'),
                applies_to_value: a.applies_to_value ? String(a.applies_to_value) : null,
                max_per_item: parseInt(String(a.max_per_item)) || 1,
                is_active: normalizeBoolean(a.is_active),
              };

              if (!addonData.label) {
                result.warnings.push(`Skipped addon with empty label`);
                continue;
              }

              const { error } = await supabase
                .from('addons')
                .insert(addonData);

              if (error) {
                console.error(`Error inserting addon ${addonData.label}:`, error);
                result.errors.push(`Addon ${addonData.label}: ${error.message}`);
              } else {
                result.migrated.addons++;
              }
            }
          } else {
            result.warnings.push('No addons found in response');
          }
        } else {
          const errorText = await addonsResponse.text();
          console.error('Failed to fetch addons:', addonsResponse.status, errorText);
          result.errors.push(`Addons fetch failed: ${addonsResponse.status} - ${errorText.substring(0, 200)}`);
        }
      } catch (err) {
        console.error('Error migrating addons:', err);
        result.errors.push(`Addons migration error: ${err instanceof Error ? err.message : String(err)}`);
      }
    } else {
      console.log('Skipping addons migration - no sheet_id_addons configured');
      result.warnings.push('Addons migration skipped: no sheet_id_addons');
    }

    // =====================================================
    // 3. MIGRATE MENUS (flat structure)
    // =====================================================
    if (sheet_ids.menus) {
      try {
        console.log('Fetching menus from Google Sheets...');
        const menusResponse = await fetch(WEBHOOKS.MENUS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (menusResponse.ok) {
          const rawText = await menusResponse.text();
          console.log(`Menus raw response (first 1000 chars): ${rawText.substring(0, 1000)}`);
          
          result.debug.menus_raw_sample = rawText.substring(0, 500);
          
          let menus: unknown[];
          try {
            if (!rawText || rawText.trim() === '' || rawText.trim() === '[]') {
              console.log('Empty menus response received');
              menus = [];
            } else {
              const parsed = JSON.parse(rawText);
              menus = Array.isArray(parsed) ? parsed : [];
            }
          } catch (parseErr) {
            console.error('Failed to parse menus JSON:', parseErr);
            console.error('Raw text was:', rawText.substring(0, 500));
            result.errors.push(`Menus JSON parse error: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
            menus = [];
          }
          
          console.log(`Parsed ${menus.length} menus`);

          if (menus.length > 0) {
            for (const menu of menus) {
              const m = menu as Record<string, unknown>;

              // Parse choice columns directly from Excel format
              const menuData = {
                user_id: restaurant_id,
                label: String(m.label || ''),
                choice1_label: m.choice1_label ? String(m.choice1_label) : null,
                choice1_productid: normalizeArray(m.choice1_productid),
                choice2_label: m.choice2_label ? String(m.choice2_label) : null,
                choice2_productid: normalizeArray(m.choice2_productid),
                choice3_label: m.choice3_label ? String(m.choice3_label) : null,
                choice3_productid: normalizeArray(m.choice3_productid),
                choice4_label: m.choice4_label ? String(m.choice4_label) : null,
                choice4_productid: normalizeArray(m.choice4_productid),
                menu_price: parseFloat(String(m.menu_price || m.price)) || 0,
                available_days: m.days ? String(m.days) : null,
                start_time: m.start_time ? String(m.start_time) : null,
                end_time: m.end_time ? String(m.end_time) : null,
                is_active: normalizeBoolean(m.is_active),
              };

              if (!menuData.label) {
                result.warnings.push(`Skipped menu with empty label`);
                continue;
              }

              const { error: menuError } = await supabase
                .from('chatbot_menus')
                .insert(menuData);

              if (menuError) {
                console.error(`Error inserting menu ${menuData.label}:`, menuError);
                result.errors.push(`Menu ${menuData.label}: ${menuError.message}`);
              } else {
                result.migrated.menus++;
              }
            }
          } else {
            result.warnings.push('No menus found in response');
          }
        } else {
          const errorText = await menusResponse.text();
          console.error('Failed to fetch menus:', menusResponse.status, errorText);
          result.errors.push(`Menus fetch failed: ${menusResponse.status} - ${errorText.substring(0, 200)}`);
        }
      } catch (err) {
        console.error('Error migrating menus:', err);
        result.errors.push(`Menus migration error: ${err instanceof Error ? err.message : String(err)}`);
      }
    } else {
      console.log('Skipping menus migration - no sheet_id_menus configured');
      result.warnings.push('Menus migration skipped: no sheet_id_menus');
    }

    // =====================================================
    // FINAL RESULT
    // =====================================================
    result.success = result.errors.length === 0;

    console.log('Migration completed:', JSON.stringify(result, null, 2));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: result.success ? 200 : 207,
    });

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function normalizeBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/\.$/, '').toLowerCase();
    return cleaned === 'true' || cleaned === '1';
  }
  return Boolean(value);
}

function normalizeArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(v => String(v));
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(v => String(v));
      }
    } catch {
      // If not JSON, try comma-separated
      if (value.includes(',')) {
        return value.split(',').map(v => v.trim()).filter(Boolean);
      }
      return value ? [value] : [];
    }
  }
  return [];
}
