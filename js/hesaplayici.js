// Desteknik - Enerji Hesaplayici JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('energy-calculator');
    const resultsSection = document.getElementById('results');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateEnergySavings();
        });
    }

    // Download report button
    const downloadBtn = document.getElementById('downloadReport');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', generatePDFReport);
    }
});

// Sektor ortalama tuketim degerleri (kWh/m2/yil)
const sectorAverages = {
    konut: 100,
    ticari: 200,
    endustriyel: 350
};

// Bina yasina gore verimlilik carpani
const ageMultipliers = {
    '0-5': 1.0,
    '5-10': 1.1,
    '10-20': 1.25,
    '20+': 1.4
};

// Mevcut onlemlerin tasarruf potansiyeli uzerindeki etkisi
const measureEffects = {
    led: 0.15,        // %15 tasarruf potansiyeli azalir (zaten uygulanmis)
    insulation: 0.20,
    hvac: 0.15,
    solar: 0.25,
    bms: 0.10,
    monitoring: 0.05
};

// Onerilerin tasarruf potansiyeli
const recommendations = {
    led: { name: 'LED Aydinlatma Donusumu', savings: 15, cost: 'Dusuk' },
    insulation: { name: 'Bina Yalitimi Iyilestirme', savings: 20, cost: 'Orta' },
    hvac: { name: 'HVAC Sistem Optimizasyonu', savings: 15, cost: 'Orta-Yuksek' },
    solar: { name: 'Gunes Enerjisi Sistemi', savings: 25, cost: 'Yuksek' },
    bms: { name: 'Bina Otomasyon Sistemi', savings: 10, cost: 'Orta' },
    monitoring: { name: 'Enerji Izleme Sistemi', savings: 5, cost: 'Dusuk' },
    behavior: { name: 'Enerji Verimli Davranis Egitimi', savings: 5, cost: 'Cok Dusuk' }
};

function calculateEnergySavings() {
    // Form verilerini al
    const buildingType = document.querySelector('input[name="buildingType"]:checked').value;
    const buildingArea = parseFloat(document.getElementById('buildingArea').value);
    const buildingAge = document.getElementById('buildingAge').value;
    const electricityConsumption = parseFloat(document.getElementById('electricityConsumption').value);
    const gasConsumption = parseFloat(document.getElementById('gasConsumption').value) || 0;
    const electricityPrice = parseFloat(document.getElementById('electricityPrice').value);
    const gasPrice = parseFloat(document.getElementById('gasPrice').value);

    // Mevcut onlemleri al
    const measures = [];
    document.querySelectorAll('input[name="measures"]:checked').forEach(cb => {
        measures.push(cb.value);
    });

    // Hesaplamalar
    const monthlyElectricityCost = electricityConsumption * electricityPrice;
    const monthlyGasCost = gasConsumption * gasPrice;
    const currentMonthlyCost = monthlyElectricityCost + monthlyGasCost;

    // Yillik tuketim
    const annualElectricity = electricityConsumption * 12;
    const annualGas = gasConsumption * 12;

    // m2 basina tuketim
    const consumptionPerSqm = annualElectricity / buildingArea;
    const sectorAvg = sectorAverages[buildingType];

    // Bina yasina gore duzeltilmis sektor ortalamasi
    const ageMultiplier = ageMultipliers[buildingAge];
    const adjustedAverage = sectorAvg * ageMultiplier;

    // Mevcut onlemlere gore tasarruf potansiyelini hesapla
    let baseSavingsPercent = 0.30; // Temel %30 tasarruf potansiyeli

    // Bina yasina gore ekstra potansiyel
    if (buildingAge === '20+') {
        baseSavingsPercent += 0.10;
    } else if (buildingAge === '10-20') {
        baseSavingsPercent += 0.05;
    }

    // Ortalama ustu tuketim varsa ekstra potansiyel
    if (consumptionPerSqm > adjustedAverage * 1.2) {
        baseSavingsPercent += 0.10;
    }

    // Mevcut onlemlerin etkisini cikar
    measures.forEach(measure => {
        if (measureEffects[measure]) {
            baseSavingsPercent -= measureEffects[measure] * 0.5; // Yarisi kadar etki
        }
    });

    // Minimum %10 tasarruf potansiyeli
    baseSavingsPercent = Math.max(0.10, baseSavingsPercent);

    // Tasarruf hesaplari
    const monthlySavings = currentMonthlyCost * baseSavingsPercent;
    const annualSavings = monthlySavings * 12;
    const fiveYearSavings = annualSavings * 5;

    // Sonuclari goster
    displayResults({
        currentMonthlyCost,
        monthlySavings,
        savingsPercent: baseSavingsPercent * 100,
        annualSavings,
        fiveYearSavings,
        consumptionPerSqm,
        sectorAvg: adjustedAverage,
        measures,
        buildingType
    });
}

function displayResults(data) {
    const resultsSection = document.getElementById('results');
    resultsSection.classList.remove('hidden');

    // Sonuclara scroll
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Mevcut maliyet
    document.getElementById('currentCost').textContent = formatCurrency(data.currentMonthlyCost) + '/ay';

    // Tasarruf miktari
    document.getElementById('savingsAmount').textContent = formatCurrency(data.monthlySavings) + '/ay';

    // Tasarruf yuzdesi
    document.getElementById('savingsPercent').textContent = '%' + Math.round(data.savingsPercent);

    // Yillik tasarruf
    document.getElementById('annualSavings').textContent = formatCurrency(data.annualSavings);

    // 5 yillik tasarruf
    document.getElementById('fiveYearSavings').textContent = formatCurrency(data.fiveYearSavings);

    // Tuketim karsilastirma
    document.getElementById('yourConsumption').textContent = Math.round(data.consumptionPerSqm) + ' kWh/m\u00B2/yil';
    document.getElementById('avgConsumption').textContent = Math.round(data.sectorAvg) + ' kWh/m\u00B2/yil';

    // Tuketim cubugu
    const barPercent = Math.min(100, (data.consumptionPerSqm / data.sectorAvg) * 100);
    document.getElementById('consumptionBar').style.width = barPercent + '%';

    // Tuketim cubugu rengi
    const consumptionBar = document.getElementById('consumptionBar');
    if (barPercent > 100) {
        consumptionBar.classList.remove('bg-energy-blue', 'bg-energy-green');
        consumptionBar.classList.add('bg-red-500');
    } else if (barPercent > 80) {
        consumptionBar.classList.remove('bg-red-500', 'bg-energy-green');
        consumptionBar.classList.add('bg-energy-blue');
    } else {
        consumptionBar.classList.remove('bg-red-500', 'bg-energy-blue');
        consumptionBar.classList.add('bg-energy-green');
    }

    // Onerileri goster
    displayRecommendations(data.measures);
}

function displayRecommendations(existingMeasures) {
    const container = document.getElementById('recommendations');
    container.innerHTML = '';

    // Uygulanmamis onlemleri bul
    const availableRecs = Object.keys(recommendations).filter(key => !existingMeasures.includes(key));

    // Tasarruf potansiyeline gore sirala
    availableRecs.sort((a, b) => recommendations[b].savings - recommendations[a].savings);

    // Ilk 5 oneriyi goster
    availableRecs.slice(0, 5).forEach((key, index) => {
        const rec = recommendations[key];
        const priority = index < 2 ? 'Yuksek' : (index < 4 ? 'Orta' : 'Dusuk');
        const priorityColor = index < 2 ? 'bg-red-100 text-red-700' : (index < 4 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700');

        const div = document.createElement('div');
        div.className = 'bg-white border border-gray-200 rounded-lg p-4 hover:border-energy-green transition';
        div.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-semibold text-gray-800">${rec.name}</h4>
                    <p class="text-sm text-gray-600">Tahmini tasarruf: %${rec.savings} | Yatirim: ${rec.cost}</p>
                </div>
                <span class="px-2 py-1 text-xs font-medium rounded ${priorityColor}">${priority} Oncelik</span>
            </div>
        `;
        container.appendChild(div);
    });

    // Tum onlemler uygulanmissa
    if (availableRecs.length === 0) {
        container.innerHTML = `
            <div class="bg-energy-light rounded-lg p-4 text-center">
                <p class="text-energy-green font-medium">Tebrikler! Temel enerji verimliligi onlemlerinin cogunu uygulamıssiniz.</p>
                <p class="text-gray-600 text-sm mt-2">Daha fazla tasarruf icin detayli bir enerji denetimi oneriyoruz.</p>
            </div>
        `;
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function generatePDFReport() {
    // Basit bir rapor olustur (gercek PDF icin bir kutuphane gerekir)
    const resultsSection = document.getElementById('results');

    if (resultsSection.classList.contains('hidden')) {
        alert('Lutfen once hesaplama yapin.');
        return;
    }

    // Rapor verilerini topla
    const currentCost = document.getElementById('currentCost').textContent;
    const savingsAmount = document.getElementById('savingsAmount').textContent;
    const savingsPercent = document.getElementById('savingsPercent').textContent;
    const annualSavings = document.getElementById('annualSavings').textContent;
    const fiveYearSavings = document.getElementById('fiveYearSavings').textContent;

    // Metin raporu olustur
    const reportContent = `
DESTEKNIK - ENERJI TASARRUF RAPORU
===================================
Tarih: ${new Date().toLocaleDateString('tr-TR')}

OZET
----
Mevcut Aylik Maliyet: ${currentCost}
Potansiyel Aylik Tasarruf: ${savingsAmount}
Tasarruf Orani: ${savingsPercent}

PROJEKSIYON
-----------
Yillik Potansiyel Tasarruf: ${annualSavings}
5 Yillik Potansiyel Tasarruf: ${fiveYearSavings}

NOT
---
Bu rapor tahmini degerlere dayanmaktadir.
Gercek tasarruf potansiyeli icin profesyonel
enerji denetimi oneriyoruz.

Iletisim: info@desteknik.com
Web: www.desteknik.com
    `.trim();

    // Raporu indir
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'desteknik-enerji-raporu.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Kullaniciya bilgi ver
    if (window.desteknik && window.desteknik.showNotification) {
        window.desteknik.showNotification('Rapor indirildi!', 'success');
    }
}
