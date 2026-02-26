const fs = require('fs');

const file = 'f:/VSCode/Landpage/themes/pizzaria/menu.html';
let content = fs.readFileSync(file, 'utf8');

const scriptStart = content.lastIndexOf('<script>');
const scriptEnd = content.lastIndexOf('</script>');

if (scriptStart > -1 && scriptEnd > scriptStart) {
    const newScript = `    <script>
        let allMenuItems = [];
        let allCategories = [];

        function escapeHTMLMenu(val) {
            const d = document.createElement('div');
            d.textContent = val ?? '';
            return d.innerHTML;
        }
        function escapeAttrMenu(val) {
            return escapeHTMLMenu(val).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        }

        async function loadMenuData() {
            try {
                const categories = await api('/categories');
                if (!categories) throw new Error('Failed to fetch categories');
                allCategories = categories;
                allMenuItems = categories.flatMap(cat => cat.dishes.map(d => ({ ...d, category_id: cat.id, category_name: cat.name })));

                renderCategoryTabs();
                renderMenuItems('all');
            } catch (e) {
                console.error('Error loading menu:', e);
                document.getElementById('menu-grid').innerHTML = '<p class="text-center py-20 col-span-3 text-red-400">Erro ao carregar cardápio</p>';
            }
        }

        function renderCategoryTabs() {
            const container = document.getElementById('category-tabs');
            const tabs = [{ id: 'all', name: 'Todas' }];
            allCategories.forEach(c => tabs.push({ id: c.id, name: c.name }));

            container.innerHTML = tabs.map(t => \`
                <button class="\${t.id === 'all' ? 'tab-active' : 'text-gray-400 hover:text-white'} whitespace-nowrap px-5 py-2.5 text-sm font-medium rounded-full border border-white/10 transition min-h-[44px]"
                    data-category="\${t.id}" onclick="filterCategory('\${t.id}')" role="tab" aria-selected="\${t.id === 'all'}">\${escapeHTMLMenu(t.name)}</button>
            \`).join('');
        }

        function filterCategory(catId) {
            document.querySelectorAll('#category-tabs button').forEach(btn => {
                btn.classList.remove('tab-active');
                btn.classList.add('text-gray-400');
                btn.setAttribute('aria-selected', 'false');
            });
            const active = document.querySelector(\`#category-tabs button[data-category="\${catId}"]\`);
            if (active) {
                active.classList.add('tab-active');
                active.classList.remove('text-gray-400');
                active.setAttribute('aria-selected', 'true');
            }
            renderMenuItems(catId);
        }

        function renderMenuItems(catId) {
            const items = catId === 'all' ? allMenuItems : allMenuItems.filter(i => String(i.category_id) === String(catId));
            const grid = document.getElementById('menu-grid');
            const empty = document.getElementById('menu-empty');

            if (items.length === 0) {
                grid.classList.add('hidden');
                empty.classList.remove('hidden');
                return;
            }

            grid.classList.remove('hidden');
            empty.classList.add('hidden');

            const defaultImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%231c1917' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='%23444'%3E🍕%3C/text%3E%3C/svg%3E";

            grid.innerHTML = items.map(item => {
                const imgSrc = (item.image_url && item.image_url.trim() !== '') ? escapeAttrMenu(item.image_url) : defaultImg;
                const formattedPrice = window.formatPrice ? window.formatPrice(item.price) : 'R$ ' + (item.price/100).toFixed(2).replace('.', ','); 
                return \`
                    <div class="card-hover bg-dark-800/60 rounded-2xl overflow-hidden border border-white/5 flex flex-col">
                        <div class="relative h-48 overflow-hidden">
                            <img src="\${imgSrc}" alt="\${escapeAttrMenu(item.name || 'Item do cardápio')}"
                                class="w-full h-full object-cover"
                                loading="lazy"
                                onerror="this.src='\${defaultImg}'">
                        </div>
                        <div class="p-6 flex flex-col flex-1">
                            <span class="text-brand-400 text-xs font-medium uppercase tracking-wider mb-2 block">\${escapeHTMLMenu(item.category_name || '')}</span>
                            <h3 class="text-white font-semibold text-lg mb-2">\${escapeHTMLMenu(item.name)}</h3>
                            <p class="text-gray-400 text-sm mb-4 flex-1">\${escapeHTMLMenu(item.description || '')}</p>
                            <div class="space-y-3 mt-auto pt-4 border-t border-white/5">
                                <div class="flex items-center justify-between">
                                    <span class="text-brand-400 font-bold text-xl">\${formattedPrice}</span>
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <button onclick="window.orderModal && window.orderModal.openQuickOrder(\${JSON.stringify(item).replace(/"/g, '&quot;')})"
                                        class="order-btn text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-3 rounded-lg transition flex items-center justify-center gap-1 font-medium min-h-[44px]">
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                                        Pedir Agora
                                    </button>
                                    <button onclick="window.cart && window.cart.add(\${JSON.stringify(item).replace(/"/g, '&quot;')}); if(window.feedback) window.feedback.success('Adicionado ao carrinho! 🛒');"
                                        class="order-btn text-sm bg-brand-500 hover:bg-brand-600 text-white px-3 py-3 rounded-lg transition flex items-center justify-center gap-1 font-medium min-h-[44px]">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                                        Adicionar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                \`;
            }).join('');
        }

        document.addEventListener('DOMContentLoaded', loadMenuData);
    </script>`;

    content = content.substring(0, scriptStart) + newScript + content.substring(scriptEnd + 9);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully replaced script block');
} else {
    console.log('Script tags not found');
}
