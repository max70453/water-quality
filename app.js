const regions = [
    { id: 1, name: "Донецк", lat: 48.034, lng: 37.720 },
    { id: 2, name: "Макеевка", lat: 48.043, lng: 37.554 },
    { id: 3, name: "Горловка", lat: 48.292, lng: 37.960 },
    { id: 4, name: "Дзержинск", lat: 48.201, lng: 37.850 },
    { id: 5, name: "Енакиево", lat: 48.234, lng: 37.516 },
    { id: 6, name: "Краматорск", lat: 48.730, lng: 37.530 },
    { id: 7, name: "Славянск", lat: 48.859, lng: 37.623 },
    { id: 8, name: "Мариуполь", lat: 47.098, lng: 37.549 },
    { id: 9, name: "Бердянск", lat: 46.747, lng: 36.784 },
    { id: 10, name: "Запорожье", lat: 47.839, lng: 35.147 },
    { id: 11, name: "Мелитополь", lat: 46.839, lng: 35.363 },
    { id: 12, name: "Луганск", lat: 48.731, lng: 39.434 },
    { id: 13, name: "Антрацит", lat: 48.108, lng: 39.933 },
    { id: 14, name: "Алчевск", lat: 48.470, lng: 38.797 },
    { id: 15, name: "Стаханов", lat: 48.645, lng: 38.649 },
    { id: 16, name: "Краснодон", lat: 48.294, lng: 39.779 },
    { id: 17, name: "Первомайск", lat: 48.042, lng: 38.535 },
    { id: 18, name: "Кировск", lat: 48.628, lng: 38.257 },
    { id: 19, name: "Лутугино", lat: 48.201, lng: 39.191 },
    { id: 20, name: "Ровеньки", lat: 48.068, lng: 39.412 },
    { id: 21, name: "Свердловск", lat: 48.061, lng: 39.657 },
    { id: 22, name: "Докучаевск", lat: 47.765, lng: 37.683 },
    { id: 23, name: "Угледар", lat: 47.807, lng: 37.250 },
    { id: 24, name: "Волноваха", lat: 47.601, lng: 36.275 },
    { id: 25, name: "Торез", lat: 48.034, lng: 38.031 },
    { id: 26, name: "Шахтёрск", lat: 48.410, lng: 38.512 },
    { id: 27, name: "Снежное", lat: 48.183, lng: 38.798 },
    { id: 28, name: "Харцызск", lat: 48.086, lng: 37.555 },
    { id: 29, name: "Амвросиевка", lat: 47.790, lng: 37.340 },
    { id: 30, name: "Иловайск", lat: 47.848, lng: 38.209 }
];

const qualityLabels = { 1: "Отличное", 2: "Хорошее", 3: "Удовлетворительное", 4: "Плохое", 5: "Критическое" };
const qualityColors = { 1: '#10b981', 2: '#84cc16', 3: '#ca8a04', 4: '#f97316', 5: '#ef4444' };

let waterData = [];
let map;
let markers = [];
let charts = {};

function generateData() {
    const now = new Date();
    document.getElementById('lastUpdate').textContent = now.toLocaleString('ru-RU');
    
    waterData = regions.map(region => {
        const rand = Math.random();
        let baseQuality;
        if (rand < 0.15) baseQuality = 1;
        else if (rand < 0.30) baseQuality = 2;
        else if (rand < 0.60) baseQuality = 3;
        else if (rand < 0.80) baseQuality = 4;
        else baseQuality = 5;
        
        return {
            id: region.id,
            name: region.name,
            lat: region.lat,
            lng: region.lng,
            ph: +(6.5 + Math.random() * 1.5).toFixed(1),
            hardness: +(4 + Math.random() * 8).toFixed(1),
            chlorine: +(0.3 + Math.random() * 1.2).toFixed(2),
            nitrates: +(5 + Math.random() * 35).toFixed(1),
            iron: +(0.1 + Math.random() * 0.9).toFixed(2),
            turbidity: +(0.5 + Math.random() * 4.5).toFixed(1),
            conductivity: +(200 + Math.random() * 600).toFixed(0),
            quality: baseQuality,
            trend: Math.random() > 0.5 ? 'up' : 'down'
        };
    });
}

function initMap() {
    map = L.map('map', {
        center: [48.0, 37.5],
        zoom: 8,
        zoomControl: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    addMarkers();
}

function addMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    waterData.forEach(region => {
        const color = qualityColors[region.quality];
        
        const marker = L.circleMarker([region.lat, region.lng], {
            radius: 12,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);

        marker.bindPopup(createPopupContent(region));
        marker.on('mouseover', function() {
            this.setStyle({ radius: 16, fillOpacity: 1 });
        });
        marker.on('mouseout', function() {
            this.setStyle({ radius: 12, fillOpacity: 0.8 });
        });
        marker.on('click', function() {
            openModal(region);
        });

        markers.push(marker);
    });
}

function createPopupContent(region) {
    const getStatus = (val, min, max) => {
        if (val >= min && val <= max) return 'good';
        return val < min ? 'bad' : 'warning';
    };
    
    const phClass = getStatus(region.ph, 6.5, 8.5);
    const hardClass = region.hardness <= 10 ? 'good' : (region.hardness <= 15 ? 'warning' : 'bad');
    const chlorClass = getStatus(region.chlorine, 0.3, 1.0);
    const nitrateClass = getStatus(region.nitrates, 0, 45);
    const ironClass = getStatus(region.iron, 0, 0.3);
    const turbidClass = getStatus(region.turbidity, 0, 3.5);

    return `
        <div class="popup-content">
            <div class="popup-header" style="color: ${qualityColors[region.quality]}">${region.name}</div>
            <div class="popup-row">
                <span class="popup-label">pH</span>
                <span class="popup-value ${phClass}">${region.ph}</span>
            </div>
            <div class="popup-row">
                <span class="popup-label">Жёсткость</span>
                <span class="popup-value ${hardClass}">${region.hardness} °Ж</span>
            </div>
            <div class="popup-row">
                <span class="popup-label">Хлор</span>
                <span class="popup-value ${chlorClass}">${region.chlorine} мг/л</span>
            </div>
            <div class="popup-row">
                <span class="popup-label">Нитраты</span>
                <span class="popup-value ${nitrateClass}">${region.nitrates} мг/л</span>
            </div>
            <div class="popup-row">
                <span class="popup-label">Железо</span>
                <span class="popup-value ${ironClass}">${region.iron} мг/л</span>
            </div>
            <div class="popup-row">
                <span class="popup-label">Мутность</span>
                <span class="popup-value ${turbidClass}">${region.turbidity} NTU</span>
            </div>
            <div class="popup-row">
                <span class="popup-label">Проводимость</span>
                <span class="popup-value">${region.conductivity} μS/cm</span>
            </div>
            <div class="popup-row">
                <span class="popup-label">Качество</span>
                <span class="popup-value" style="color: ${qualityColors[region.quality]}">${qualityLabels[region.quality]}</span>
            </div>
        </div>
    `;
}

function selectRegion(id) {
    const region = waterData.find(d => d.id === id);
    if (!region) return;

    document.querySelectorAll('.region-item').forEach(item => {
        item.classList.toggle('active', parseInt(item.dataset.id) === id);
    });

    map.setView([region.lat, region.lng], 10);

    document.querySelectorAll('#tableBody tr').forEach(r => {
        r.classList.toggle('selected', parseInt(r.dataset.id) === id);
    });
}

function populateRegionList() {
    const list = document.getElementById('regionList');
    list.innerHTML = waterData.map(d => `
        <div class="region-item" data-id="${d.id}">
            <span class="region-name">
                <span class="quality-dot" style="background: ${qualityColors[d.quality]}"></span>
                ${d.name}
            </span>
            <span class="quality-badge quality-${d.quality}">${qualityLabels[d.quality]}</span>
        </div>
    `).join('');

    list.querySelectorAll('.region-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.id);
            selectRegion(id);
            const region = waterData.find(d => d.id === id);
            map.setView([region.lat, region.lng], 10);
        });
    });
}

function populateTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = waterData.map(d => `
        <tr data-id="${d.id}">
            <td><strong>${d.name}</strong></td>
            <td>${d.ph}</td>
            <td>${d.hardness}</td>
            <td>${d.chlorine}</td>
            <td>${d.nitrates}</td>
            <td>${d.iron}</td>
            <td>${d.turbidity}</td>
            <td>${d.conductivity}</td>
            <td><span class="quality-badge quality-${d.quality}">${qualityLabels[d.quality]}</span></td>
            <td>${d.trend === 'up' ? '📈' : '📉'}</td>
        </tr>
    `).join('');

    tbody.querySelectorAll('tr').forEach(row => {
        row.addEventListener('click', () => selectRegion(parseInt(row.dataset.id)));
    });
}

function initCharts() {
    const qualityCounts = [0, 0, 0, 0, 0];
    waterData.forEach(d => qualityCounts[d.quality - 1]++);

    charts.quality = new Chart(document.getElementById('qualityChart'), {
        type: 'doughnut',
        data: {
            labels: Object.values(qualityLabels),
            datasets: [{
                data: qualityCounts,
                backgroundColor: Object.values(qualityColors),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { color: '#1e293b' } } }
        }
    });

    const avgValues = [
        waterData.reduce((s, d) => s + d.ph, 0) / waterData.length,
        waterData.reduce((s, d) => s + d.hardness, 0) / waterData.length,
        waterData.reduce((s, d) => s + d.chlorine, 0) / waterData.length
    ];

    const avgPh = waterData.reduce((s, d) => s + d.ph, 0) / waterData.length;
    const avgHardness = waterData.reduce((s, d) => s + d.hardness, 0) / waterData.length;
    const avgChlorine = waterData.reduce((s, d) => s + d.chlorine, 0) / waterData.length;
    const avgNitrates = waterData.reduce((s, d) => s + d.nitrates, 0) / waterData.length;
    const avgIron = waterData.reduce((s, d) => s + d.iron, 0) / waterData.length;
    const avgTurbidity = waterData.reduce((s, d) => s + d.turbidity, 0) / waterData.length;
    const avgConductivity = waterData.reduce((s, d) => s + d.conductivity, 0) / waterData.length;

    charts.metrics = new Chart(document.getElementById('metricsChart'), {
        type: 'bar',
        data: {
            labels: ['pH', 'Жёсткость', 'Хлор', 'Нитраты', 'Железо', 'Мутность', 'Проводимость'],
            datasets: [{
                label: 'Среднее значение',
                data: [
                    (avgPh / 14) * 100,
                    (avgHardness / 20) * 100,
                    (avgChlorine / 5) * 100,
                    (avgNitrates / 50) * 100,
                    (avgIron / 3) * 100,
                    (avgTurbidity / 100) * 100,
                    (avgConductivity / 1000) * 100
                ],
                backgroundColor: ['#0ea5e9', '#84cc16', '#f97316', '#10b981', '#ca8a04', '#6366f1', '#ec4899'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.1)' }, ticks: { color: '#64748b', callback: v => v + '%' } },
                x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function populateSelectors() {
    const options = '<option value="">Выберите регион</option>' + 
        waterData.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

    document.querySelectorAll('.select-region').forEach(sel => {
        sel.innerHTML = options;
    });

    document.getElementById('dynamicsRegion').addEventListener('change', updateDynamicsCharts);
    
    document.querySelectorAll('.compare-select').forEach(sel => {
        sel.addEventListener('change', updateComparison);
    });
}

function updateDynamicsCharts() {
    const regionId = document.getElementById('dynamicsRegion').value;
    if (!regionId) return;

    const region = waterData.find(d => d.id == regionId);
    const days = parseInt(document.getElementById('periodSelect').value);
    const labels = Array.from({length: days}, (_, i) => `Д${days - i}`);

    const generateTrend = (base, variance) => labels.map(() => +(base + (Math.random() - 0.5) * variance).toFixed(2));

    ['ph', 'hardness', 'chlorine', 'nitrate', 'iron', 'turbidity', 'conductivity', 'qualityIndex'].forEach(key => {
        if (charts[key]) charts[key].destroy();
    });

    charts.ph = new Chart(document.getElementById('phChart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{ label: 'pH', data: generateTrend(region.ph, 0.5), borderColor: '#0ea5e9', tension: 0.4, fill: true, backgroundColor: 'rgba(14, 165, 233, 0.1)' }]
        },
        options: getChartOptions('pH', 0, 14)
    });

    charts.hardness = new Chart(document.getElementById('hardnessChart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{ label: 'Жёсткость', data: generateTrend(region.hardness, 2), borderColor: '#84cc16', tension: 0.4, fill: true, backgroundColor: 'rgba(132,204,22,0.1)' }]
        },
        options: getChartOptions('°Ж', 0, 20)
    });

    charts.chlorine = new Chart(document.getElementById('chlorineChart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{ label: 'Хлор', data: generateTrend(region.chlorine, 0.3), borderColor: '#f97316', tension: 0.4, fill: true, backgroundColor: 'rgba(249,115,22,0.1)' }]
        },
        options: getChartOptions('мг/л', 0, 2)
    });

    charts.nitrate = new Chart(document.getElementById('nitrateChart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{ label: 'Нитраты', data: generateTrend(region.nitrates, 10), borderColor: '#10b981', tension: 0.4, fill: true, backgroundColor: 'rgba(16, 185, 129, 0.1)' }]
        },
        options: getChartOptions('мг/л', 0, 60)
    });

    charts.iron = new Chart(document.getElementById('ironChart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{ label: 'Железо', data: generateTrend(region.iron, 0.2), borderColor: '#ca8a04', tension: 0.4, fill: true, backgroundColor: 'rgba(202, 138, 4, 0.1)' }]
        },
        options: getChartOptions('мг/л', 0, 1)
    });

    charts.turbidity = new Chart(document.getElementById('turbidityChart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{ label: 'Мутность', data: generateTrend(region.turbidity, 1), borderColor: '#6366f1', tension: 0.4, fill: true, backgroundColor: 'rgba(99, 102, 241, 0.1)' }]
        },
        options: getChartOptions('NTU', 0, 5)
    });

    charts.conductivity = new Chart(document.getElementById('conductivityChart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{ label: 'Проводимость', data: generateTrend(region.conductivity, 100), borderColor: '#ec4899', tension: 0.4, fill: true, backgroundColor: 'rgba(236, 72, 153, 0.1)' }]
        },
        options: getChartOptions('μS/cm', 0, 1000)
    });

    charts.qualityIndex = new Chart(document.getElementById('qualityIndexChart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{ label: 'Индекс', data: generateTrend(region.quality, 1), borderColor: '#7c3aed', tension: 0.4, fill: true, backgroundColor: 'rgba(124, 58, 237, 0.1)' }]
        },
        options: getChartOptions('Балл', 0, 5)
    });
}

function getChartOptions(title, min, max) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { min: min, max: max, grid: { color: 'rgba(0,0,0,0.1)' }, ticks: { color: '#64748b' } },
            x: { grid: { display: false }, ticks: { color: '#64748b' } }
        },
        plugins: { legend: { display: false } }
    };
}

const compareColors = [
    '#0ea5e9', '#f97316', '#10b981', '#8b5cf6', '#ec4899', 
    '#14b8a6', '#f59e0b', '#6366f1', '#ef4444', '#84cc16'
];

let compareRegions = [1, 2];
let maxRegions = 10;

function addCompareRegion() {
    if (compareRegions.length >= maxRegions) {
        alert('Максимальное количество регионов для сравнения: ' + maxRegions);
        return;
    }
    
    const newIndex = compareRegions.length + 1;
    compareRegions.push(newIndex);
    
    const container = document.getElementById('comparisonRegions');
    const newCard = document.createElement('div');
    newCard.className = 'card';
    newCard.id = 'compareCard' + newIndex;
    newCard.style.position = 'relative';
    newCard.innerHTML = `
        <button class="remove-region-btn" onclick="removeCompareRegion(${newIndex})">&times;</button>
        <div class="card-title">Регион ${newIndex}</div>
        <select id="compareRegion${newIndex}" class="select-region compare-select" data-index="${newIndex}"></select>
        <div class="region-info" id="region${newIndex}Info"></div>
    `;
    
    container.appendChild(newCard);
    
    const select = document.getElementById('compareRegion' + newIndex);
    select.innerHTML = '<option value="">Выберите регион</option>' + 
        waterData.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    select.addEventListener('change', updateComparison);
}

function removeCompareRegion(index) {
    if (compareRegions.length <= 2) {
        return;
    }
    
    compareRegions = compareRegions.filter(i => i !== index);
    
    const card = document.getElementById('compareCard' + index);
    if (card) {
        card.remove();
    }
    
    compareRegions.forEach((regIndex, i) => {
        const card = document.getElementById('compareCard' + regIndex);
        if (card) {
            card.querySelector('.card-title').textContent = 'Регион ' + (i + 1);
        }
    });
    
    compareRegions = compareRegions.map((_, i) => i + 1);
    
    rebuildCompareCards();
    
    updateComparison();
}

function rebuildCompareCards() {
    const container = document.getElementById('comparisonRegions');
    
    compareRegions.forEach((oldIndex, newIdx) => {
        const oldCard = document.getElementById('compareCard' + oldIndex);
        if (oldCard) {
            oldCard.id = 'compareCard' + (newIdx + 1);
            oldCard.querySelector('.card-title').textContent = 'Регион ' + (newIdx + 1);
            
            const select = oldCard.querySelector('select');
            select.id = 'compareRegion' + (newIdx + 1);
            select.dataset.index = newIdx + 1;
            
            const info = oldCard.querySelector('.region-info');
            info.id = 'region' + (newIdx + 1) + 'Info';
            
            const removeBtn = oldCard.querySelector('.remove-region-btn');
            if (removeBtn) {
                removeBtn.setAttribute('onclick', 'removeCompareRegion(' + (newIdx + 1) + ')');
            }
        }
    });
}

function resetComparison() {
    compareRegions = [1, 2];
    
    const container = document.getElementById('comparisonRegions');
    container.innerHTML = '';
    
    for (let i = 1; i <= 2; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        card.id = 'compareCard' + i;
        card.innerHTML = `
            <div class="card-title">Регион ${i}</div>
            <select id="compareRegion${i}" class="select-region compare-select" data-index="${i}"></select>
            <div class="region-info" id="region${i}Info"></div>
        `;
        container.appendChild(card);
        
        const select = document.getElementById('compareRegion' + i);
        select.innerHTML = '<option value="">Выберите регион</option>' + 
            waterData.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
        select.addEventListener('change', updateComparison);
    }
    
    if (charts.compare) {
        charts.compare.destroy();
        charts.compare = null;
    }
}

function updateComparison() {
    const selectedRegions = [];
    
    compareRegions.forEach(index => {
        const select = document.getElementById('compareRegion' + index);
        if (select && select.value) {
            const region = waterData.find(d => d.id == select.value);
            if (region) {
                selectedRegions.push(region);
                
                const infoDiv = document.getElementById('region' + index + 'Info');
                if (infoDiv) {
                    infoDiv.innerHTML = renderRegionInfo(region);
                }
            }
        }
    });
    
    if (selectedRegions.length < 2) {
        return;
    }
    
    if (charts.compare) {
        charts.compare.destroy();
    }
    
    const datasets = selectedRegions.map((region, idx) => ({
        label: region.name,
        data: [
            region.ph / 14 * 100,
            region.hardness / 20 * 100,
            region.chlorine / 2 * 100,
            region.nitrates / 60 * 100,
            region.iron / 1 * 100,
            region.turbidity / 5 * 100,
            region.conductivity / 1000 * 100,
            (6 - region.quality) / 5 * 100
        ],
        borderColor: compareColors[idx % compareColors.length],
        backgroundColor: compareColors[idx % compareColors.length] + '33'
    }));
    
    charts.compare = new Chart(document.getElementById('compareChart'), {
        type: 'radar',
        data: {
            labels: ['pH', 'Жёсткость', 'Хлор', 'Нитраты', 'Железо', 'Мутность', 'Проводимость', 'Качество'],
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: { 
                    grid: { color: 'rgba(0,0,0,0.1)' }, 
                    ticks: { color: '#64748b', backdropColor: 'transparent' }, 
                    pointLabels: { color: '#1e293b', font: { size: 11 } },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: { 
                legend: { 
                    labels: { color: '#1e293b' } 
                } 
            }
        }
    });
}

function renderRegionInfo(region) {
    const getClass = (val, min, max) => val >= min && val <= max ? 'good' : val < min ? 'bad' : 'warning';
    return `
        <div class="region-info-name">
            <span class="quality-dot" style="background: ${qualityColors[region.quality]}"></span>
            ${region.name}
        </div>
        <div class="param-row"><span class="param-label">pH</span><span class="param-value ${getClass(region.ph, 6.5, 8.5)}">${region.ph}</span></div>
        <div class="param-row"><span class="param-label">Жёсткость</span><span class="param-value ${region.hardness <= 10 ? 'good' : 'warning'}">${region.hardness} °Ж</span></div>
        <div class="param-row"><span class="param-label">Хлор</span><span class="param-value ${getClass(region.chlorine, 0.3, 1.0)}">${region.chlorine} мг/л</span></div>
        <div class="param-row"><span class="param-label">Нитраты</span><span class="param-value ${getClass(region.nitrates, 0, 45)}">${region.nitrates} мг/л</span></div>
        <div class="param-row"><span class="param-label">Железо</span><span class="param-value ${getClass(region.iron, 0, 0.3)}">${region.iron} мг/л</span></div>
        <div class="param-row"><span class="param-label">Мутность</span><span class="param-value ${getClass(region.turbidity, 0, 3.5)}">${region.turbidity} NTU</span></div>
        <div class="param-row"><span class="param-label">Качество</span><span class="param-value" style="color: ${qualityColors[region.quality]}">${qualityLabels[region.quality]}</span></div>
    `;
}

function updateStats() {
    const good = waterData.filter(d => d.quality <= 2).length;
    const avgQuality = (waterData.reduce((s, d) => s + d.quality, 0) / waterData.length).toFixed(1);
    const alerts = waterData.filter(d => d.quality >= 4).length;

    document.getElementById('totalRegions').textContent = waterData.length;
    document.getElementById('goodPercent').textContent = Math.round(good / waterData.length * 100) + '%';
    document.getElementById('avgQuality').textContent = avgQuality;
    document.getElementById('avgQuality').className = 'stat-value ' + (avgQuality > 2.5 ? 'warning' : '');
    document.getElementById('alerts').textContent = alerts;
    document.getElementById('alerts').className = 'stat-value ' + (alerts > 0 ? 'danger' : '');
}

function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
            
            if (tab.dataset.tab === 'map') {
                setTimeout(() => map.invalidateSize(), 100);
            }
        });
    });
}

function exportData() {
    const csv = 'Регион,pH,Жёсткость,Хлор,Нитраты,Железо,Мутность,Проводимость,Качество\n' + 
        waterData.map(d => `${d.name},${d.ph},${d.hardness},${d.chlorine},${d.nitrates},${d.iron},${d.turbidity},${d.conductivity},${qualityLabels[d.quality]}`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'water_quality_data.csv';
    a.click();
}

function getClassByRange(value, ranges) {
    if (value <= ranges.excellent) return 'excellent';
    if (value <= ranges.good) return 'good';
    if (value <= ranges.satisfactory) return 'satisfactory';
    if (value <= ranges.bad) return 'bad';
    return 'dangerous';
}

function getLabelByRange(value, ranges) {
    if (value <= ranges.excellent) return 'Отлично';
    if (value <= ranges.good) return 'Хорошо';
    if (value <= ranges.satisfactory) return 'Удовлетворительно';
    if (value <= ranges.bad) return 'Плохо';
    return 'Опасно';
}

function openModal(region) {
    const physicalData = [
        { name: 'pH', value: region.ph, ranges: { excellent: 7.0, good: 7.5, satisfactory: 8.0, bad: 9.0 }, unit: '' },
        { name: 'Жёсткость', value: region.hardness, ranges: { excellent: 7, good: 10, satisfactory: 15, bad: 20 }, unit: '°Ж' },
        { name: 'Хлор остаточный', value: region.chlorine, ranges: { excellent: 0.3, good: 0.5, satisfactory: 0.8, bad: 1.2 }, unit: 'мг/л' },
        { name: 'Мутность', value: region.turbidity, ranges: { excellent: 1.0, good: 2.0, satisfactory: 3.0, bad: 5.0 }, unit: 'NTU' },
        { name: 'Железо общее', value: region.iron, ranges: { excellent: 0.1, good: 0.2, satisfactory: 0.3, bad: 0.5 }, unit: 'мг/л' },
        { name: 'Проводимость', value: region.conductivity, ranges: { excellent: 400, good: 600, satisfactory: 800, bad: 1000 }, unit: 'μS/cm' }
    ];

    const biologicalData = [
        { name: 'Нитраты', value: region.nitrates, ranges: { excellent: 20, good: 35, satisfactory: 45, bad: 60 }, unit: 'мг/л' },
        { name: 'Нитриты', value: +(Math.random() * 0.1).toFixed(3), ranges: { excellent: 0.02, good: 0.05, satisfactory: 0.08, bad: 0.1 }, unit: 'мг/л' },
        { name: 'Аммоний', value: +(Math.random() * 1.5).toFixed(2), ranges: { excellent: 0.3, good: 0.7, satisfactory: 1.2, bad: 1.5 }, unit: 'мг/л' },
        { name: 'Фосфаты', value: +(Math.random() * 0.5).toFixed(2), ranges: { excellent: 0.1, good: 0.3, satisfactory: 0.4, bad: 0.5 }, unit: 'мг/л' }
    ];

    const microData = [
        { name: 'Общие колиформные бактерии', value: Math.floor(Math.random() * 3), ranges: { excellent: 0, good: 1, satisfactory: 2, bad: 3 }, unit: 'КОЕ/100мл' },
        { name: 'Кишечная палочка', value: Math.floor(Math.random() * 2), ranges: { excellent: 0, good: 0, satisfactory: 1, bad: 2 }, unit: 'КОЕ/100мл' },
        { name: 'Энтерококки', value: Math.floor(Math.random() * 2), ranges: { excellent: 0, good: 1, satisfactory: 1, bad: 2 }, unit: 'КОЕ/100мл' },
        { name: 'Общее микробное число', value: Math.floor(50 + Math.random() * 150), ranges: { excellent: 50, good: 100, satisfactory: 150, bad: 200 }, unit: 'КОЕ/мл' }
    ];

    const generalData = [
        { name: 'Класс качества', value: region.quality, ranges: { excellent: 1, good: 2, satisfactory: 3, bad: 4 }, unit: '' },
        { name: 'Индекс загрязнения', value: (Math.random() * 2 + 1).toFixed(1), ranges: { excellent: 1, good: 2, satisfactory: 3, bad: 4 }, unit: '' },
        { name: 'Тренд', value: region.trend === 'up' ? 'Улучшение' : 'Ухудшение', ranges: { excellent: 'up', good: 'up', satisfactory: 'stable', bad: 'down' }, unit: '' }
    ];

    document.getElementById('modalTitle').textContent = region.name;

    const renderParams = (params) => {
        return params.map(p => {
            const value = p.value;
            const displayValue = typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(p.name === 'pH' ? 1 : 2)) : value;
            let className;
            if (p.name === 'Класс качества' || p.name === 'Тренд') {
                className = value <= 1 ? 'excellent' : value <= 2 ? 'good' : value <= 3 ? 'satisfactory' : value <= 4 ? 'bad' : 'dangerous';
            } else if (p.name === 'Тренд') {
                className = value === 'Улучшение' ? 'excellent' : value === 'Стабильно' ? 'good' : 'bad';
            } else {
                className = getClassByRange(value, p.ranges);
            }
            return `
                <div class="param-item">
                    <span class="param-item-name">${p.name}</span>
                    <span class="param-item-value ${className}">${displayValue}${p.unit}</span>
                </div>
            `;
        }).join('');
    };

    document.getElementById('physicalParams').innerHTML = renderParams(physicalData);
    document.getElementById('biologicalParams').innerHTML = renderParams(biologicalData);
    document.getElementById('microParams').innerHTML = renderParams(microData);
    document.getElementById('generalParams').innerHTML = renderParams(generalData);

    const qualityText = qualityLabels[region.quality];
    const qualityColor = qualityColors[region.quality];
    document.getElementById('modalQuality').innerHTML = `
        <span>Общее качество воды:</span>
        <span class="quality-score quality-score-${region.quality}">${qualityText}</span>
    `;

    document.getElementById('regionModal').classList.add('active');
}

function closeModal() {
    document.getElementById('regionModal').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('waterQualityUser');
    if (savedUser) {
        const currentUser = JSON.parse(savedUser);
        document.getElementById('userName').textContent = currentUser.name;
    }
    
    generateData();
    initMap();
    initCharts();
    populateRegionList();
    populateTable();
    populateSelectors();
    updateStats();
    initTabs();

    document.getElementById('periodSelect').addEventListener('change', updateDynamicsCharts);
});

function logout() {
    localStorage.removeItem('waterQualityUser');
    window.location.href = 'login.html';
}
