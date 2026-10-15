(() => {
  'use strict';

  const elements = window.ELEMENTS;
  const byId = id => document.getElementById(id);
  const searchInput = byId('search-input');
  const periodFilter = byId('period-filter');
  const groupFilter = byId('group-filter');
  const categoryFilter = byId('category-filter');
  const periodicGrid = byId('periodic-grid');
  const profileRoot = byId('element-profile');
  const profileDialog = byId('element-dialog');
  const closeProfileButton = byId('close-profile');
  const resultCount = byId('result-count');
  const filterSummary = byId('filter-summary');
  const resetButton = byId('reset-filters');
  let lastSelectedTile = null;

  const categories = [
    'Alkali metal', 'Alkaline earth metal', 'Transition metal', 'Post-transition metal',
    'Metalloid', 'Nonmetal', 'Halogen', 'Noble gas', 'Lanthanide', 'Actinide',
  ];
  const categoryClass = {
    'Nonmetal': 'cat-nonmetal',
    'Noble gas': 'cat-noble-gas',
    'Alkali metal': 'cat-alkali-metal',
    'Alkaline earth metal': 'cat-alkaline-earth-metal',
    'Metalloid': 'cat-metalloid',
    'Halogen': 'cat-halogen',
    'Transition metal': 'cat-transition-metal',
    'Post-transition metal': 'cat-post-transition-metal',
    'Lanthanide': 'cat-lanthanide',
    'Actinide': 'cat-actinide',
  };
  const categoryColors = {
    'Alkali metal': '#ffab72', 'Alkaline earth metal': '#d7e47d',
    'Transition metal': '#82b5ff', 'Post-transition metal': '#7dc7e9',
    'Metalloid': '#f0d274', 'Nonmetal': '#6edbd2', 'Halogen': '#f38cb2',
    'Noble gas': '#b2a1ff', 'Lanthanide': '#df9ee8', 'Actinide': '#f18e9d',
  };
  const shellNames = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];

  if (!Array.isArray(elements) || elements.length !== 118) {
    profileRoot.innerHTML = '<div class="data-error">Không tải được bộ dữ liệu 118 nguyên tố.</div>';
    return;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }

  function normalize(value) {
    return String(value ?? '')
      .toLocaleLowerCase('vi')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .trim();
  }

  function compactMass(value) {
    if (value == null) return '—';
    return Number(value).toFixed(Number(value) >= 100 ? 1 : 2).replace(/\.0$/, '');
  }

  function formatNumber(value, digits = 3) {
    if (value == null || !Number.isFinite(Number(value))) return '—';
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: digits }).format(Number(Number(value).toFixed(digits)));
  }

  function formatMass(value) {
    if (value == null) return 'Chưa có dữ liệu';
    return `${formatNumber(value, 4)} u`;
  }

  function temperatureC(kelvin) {
    if (kelvin == null || !Number.isFinite(kelvin)) return '—';
    const celsius = kelvin - 273.15;
    const digits = Math.abs(celsius) >= 1000 ? 0 : Math.abs(celsius) >= 100 ? 1 : 2;
    return `${formatNumber(celsius, digits)} °C`;
  }

  function showValue(value, unit = '') {
    if (value == null || !Number.isFinite(Number(value))) return '—';
    const digits = Math.abs(Number(value)) > 0 && Math.abs(Number(value)) < 0.01 ? 8 : 3;
    return `${formatNumber(value, digits)}${unit}`;
  }

  function configHtml(configuration) {
    const safe = escapeHtml(configuration);
    return safe.replace(/(\d+[spdf])(\d+)/g, '$1<sup>$2</sup>');
  }

  function initializeFilters() {
    for (let group = 1; group <= 18; group += 1) {
      const option = document.createElement('option');
      option.value = String(group);
      option.textContent = `Nhóm ${group}`;
      groupFilter.append(option);
    }
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = categoryVi(category);
      categoryFilter.append(option);
    });

    const legend = byId('legend-items');
    categories.forEach(category => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'legend-item';
      button.dataset.category = category;
      button.style.setProperty('--tone', categoryColors[category]);
      button.innerHTML = `<span class="legend-swatch" aria-hidden="true"></span>${escapeHtml(categoryVi(category))}`;
      button.setAttribute('aria-label', `Lọc họ ${categoryVi(category)}`);
      button.addEventListener('click', () => {
        categoryFilter.value = categoryFilter.value === category ? 'all' : category;
        updateFilters();
      });
      legend.append(button);
    });
  }

  function categoryVi(category) {
    return elements.find(element => element.category === category)?.categoryVi ?? category;
  }

  function createTable() {
    for (let group = 1; group <= 18; group += 1) {
      const label = document.createElement('button');
      label.type = 'button';
      label.className = 'group-label';
      label.style.gridColumn = String(group + 1);
      label.style.gridRow = '1';
      label.textContent = String(group);
      label.title = `Lọc nhóm ${group}`;
      label.setAttribute('aria-label', `Lọc nhóm ${group}`);
      label.addEventListener('click', () => {
        groupFilter.value = groupFilter.value === String(group) ? 'all' : String(group);
        updateFilters();
      });
      periodicGrid.append(label);
    }

    for (let period = 1; period <= 7; period += 1) {
      const label = document.createElement('button');
      label.type = 'button';
      label.className = 'period-label';
      label.style.gridColumn = '1';
      label.style.gridRow = String(period + 1);
      label.textContent = String(period);
      label.title = `Lọc chu kỳ ${period}`;
      label.setAttribute('aria-label', `Lọc chu kỳ ${period}`);
      label.addEventListener('click', () => {
        periodFilter.value = periodFilter.value === String(period) ? 'all' : String(period);
        updateFilters();
      });
      periodicGrid.append(label);
    }

    const lanthanideLabel = document.createElement('div');
    lanthanideLabel.className = 'series-label';
    lanthanideLabel.style.gridColumn = '1';
    lanthanideLabel.style.gridRow = '10';
    lanthanideLabel.textContent = '4f';
    lanthanideLabel.title = 'Dãy lantanide';
    periodicGrid.append(lanthanideLabel);

    const actinideLabel = document.createElement('div');
    actinideLabel.className = 'series-label';
    actinideLabel.style.gridColumn = '1';
    actinideLabel.style.gridRow = '11';
    actinideLabel.textContent = '5f';
    actinideLabel.title = 'Dãy actinide';
    periodicGrid.append(actinideLabel);

    const seriesBand = document.createElement('div');
    seriesBand.className = 'series-band';
    seriesBand.style.gridColumn = '5 / span 14';
    seriesBand.style.gridRow = '9';
    seriesBand.textContent = 'DÃY f  /  LANTANIDE & ACTINIDE';
    periodicGrid.append(seriesBand);

    elements.forEach(element => {
      const button = document.createElement('button');
      const detached = element.z >= 58 && element.z <= 71 || element.z >= 90 && element.z <= 103;
      const gridColumn = detached ? element.gridColumn + 1 : element.group + 1;
      const gridRow = detached ? element.period === 6 ? 10 : 11 : element.period + 1;
      button.type = 'button';
      button.className = `element-tile ${categoryClass[element.category]}`;
      button.dataset.z = String(element.z);
      button.dataset.category = element.category;
      button.style.gridColumn = String(gridColumn);
      button.style.gridRow = String(gridRow);
      button.setAttribute('aria-label', `${element.nameVi}, ${element.name}, số hiệu nguyên tử ${element.z}, chu kỳ ${element.period}, ${element.group ? `nhóm ${element.group}` : 'khối f'}`);
      button.setAttribute('aria-pressed', 'false');
      button.title = `${element.nameVi} (${element.name}) · Z = ${element.z} · Chu kỳ ${element.period} · ${element.group ? `Nhóm ${element.group}` : 'Khối f'}`;
      button.innerHTML = `<span class="tile-top"><span>${element.z}</span><span class="tile-mass">${compactMass(element.mass)}</span></span><span class="tile-symbol">${element.symbol}</span><span class="tile-name">${escapeHtml(element.nameVi)}</span>`;
      button.addEventListener('click', () => selectElement(element, button));
      periodicGrid.append(button);
    });
  }

  function isMatch(element) {
    const query = normalize(searchInput.value);
    const searchableName = [element.nameVi, ...(element.nameViAliases ?? []), element.name, element.symbol, element.z].join(' ');
    const queryMatch = !query || normalize(searchableName).includes(query);
    const periodMatch = periodFilter.value === 'all' || element.period === Number(periodFilter.value);
    const groupMatch = groupFilter.value === 'all' || element.group === Number(groupFilter.value);
    const categoryMatch = categoryFilter.value === 'all' || element.category === categoryFilter.value;
    return queryMatch && periodMatch && groupMatch && categoryMatch;
  }

  function updateFilters() {
    const buttons = periodicGrid.querySelectorAll('.element-tile');
    let count = 0;
    buttons.forEach(button => {
      const element = elements[Number(button.dataset.z) - 1];
      const match = isMatch(element);
      button.classList.toggle('is-dimmed', !match);
      if (match) count += 1;
    });
    resultCount.textContent = `${count} / 118 nguyên tố`;
    const active = [];
    if (searchInput.value.trim()) active.push(`“${searchInput.value.trim()}”`);
    if (periodFilter.value !== 'all') active.push(`chu kỳ ${periodFilter.value}`);
    if (groupFilter.value !== 'all') active.push(`nhóm ${groupFilter.value}`);
    if (categoryFilter.value !== 'all') active.push(categoryVi(categoryFilter.value));
    filterSummary.textContent = active.length ? `· ${active.join(' · ')}` : '';
    byId('legend-items').querySelectorAll('.legend-item').forEach(item => {
      const activeCategory = categoryFilter.value === item.dataset.category;
      item.classList.toggle('is-active', activeCategory);
      item.setAttribute('aria-pressed', String(activeCategory));
    });
  }

  function resetFilters() {
    searchInput.value = '';
    periodFilter.value = 'all';
    groupFilter.value = 'all';
    categoryFilter.value = 'all';
    updateFilters();
    searchInput.focus();
  }

  function electronDiagram(element) {
    const center = 130;
    const shellMarkup = element.shells.map((count, index) => {
      const radius = 21 + index * 12.8;
      const planeAngle = (index * 37 + 14) % 180;
      const tilt = planeAngle * Math.PI / 180;
      const projectedRadiusY = radius * (.58 + (index % 3) * .055);
      const dots = Array.from({ length: count }, (_, electronIndex) => {
        const angle = (Math.PI * 2 * electronIndex / count) - Math.PI / 2 + index * .29;
        const orbitX = Math.cos(angle) * radius;
        const orbitY = Math.sin(angle) * projectedRadiusY;
        const x = center + orbitX * Math.cos(tilt) - orbitY * Math.sin(tilt);
        const y = center + orbitX * Math.sin(tilt) + orbitY * Math.cos(tilt);
        const dotRadius = count > 18 ? 1.8 : count > 8 ? 2.1 : 2.65;
        return `<circle class="electron-dot" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${dotRadius}" />`;
      }).join('');
      const duration = 60;
      const direction = index % 2 === 0 ? 'normal' : 'reverse';
      const delay = -(index * .72).toFixed(2);
      return `<g class="electron-orbit" style="--orbit-duration:${duration}s;animation-direction:${direction};animation-delay:${delay}s"><ellipse class="shell-ring" cx="${center}" cy="${center}" rx="${radius}" ry="${projectedRadiusY.toFixed(2)}" transform="rotate(${planeAngle} ${center} ${center})" />${dots}</g>`;
    }).join('');
    const massNumber = Math.round(element.mass ?? element.z);
    const neutrons = Math.max(0, massNumber - element.z);
    const gradientId = `nucleus-gradient-${element.z}`;
    return `<svg class="atom-svg" viewBox="0 0 260 260" role="img" aria-label="Mô hình nguyên tử 3D minh họa của ${escapeHtml(element.nameVi)}: ${element.shells.length} lớp, ${element.z} electron chuyển động quanh hạt nhân">
      <defs><radialGradient id="${gradientId}" cx="29%" cy="24%"><stop offset="0" stop-color="#f5fff0"/><stop offset=".18" stop-color="${categoryColors[element.category]}"/><stop offset=".68" stop-color="${categoryColors[element.category]}"/><stop offset="1" stop-color="#142334"/></radialGradient></defs>
      ${shellMarkup}
      <circle class="nucleus-core" cx="${center}" cy="${center}" r="19" style="fill:url(#${gradientId})" />
      <ellipse class="nucleus-highlight" cx="${center - 5}" cy="${center - 7}" rx="5" ry="2.4" transform="rotate(-36 ${center - 5} ${center - 7})" />
      <text class="nucleus-text" x="${center}" y="${center}">Z=${element.z}</text>
    </svg><span class="atom-model-badge">MÔ HÌNH 3D · ${element.shells.length} LỚP</span><span class="atom-caption">p⁺ ${element.z} &nbsp; / &nbsp; n⁰ ≈ ${neutrons}</span>`;
  }

  function orbitalSvg(block) {
    const label = { s: 'cầu', p: 'hai thùy', d: 'bốn thùy', f: 'đa thùy' }[block] ?? 'orbital';
    const shapes = {
      s: '<circle cx="32" cy="32" r="17" fill="currentColor" fill-opacity=".18" stroke="currentColor" stroke-width="1.4"/><circle cx="32" cy="32" r="7" fill="currentColor" fill-opacity=".42"/>',
      p: '<ellipse cx="21" cy="32" rx="10" ry="18" fill="currentColor" fill-opacity=".27"/><ellipse cx="43" cy="32" rx="10" ry="18" fill="currentColor" fill-opacity=".27"/><path d="M32 12v40" stroke="currentColor" stroke-opacity=".55" stroke-width="1" stroke-dasharray="2 3"/>',
      d: '<ellipse cx="20" cy="20" rx="8" ry="13" transform="rotate(-45 20 20)" fill="currentColor" fill-opacity=".33"/><ellipse cx="44" cy="20" rx="8" ry="13" transform="rotate(45 44 20)" fill="currentColor" fill-opacity=".33"/><ellipse cx="20" cy="44" rx="8" ry="13" transform="rotate(45 20 44)" fill="currentColor" fill-opacity=".33"/><ellipse cx="44" cy="44" rx="8" ry="13" transform="rotate(-45 44 44)" fill="currentColor" fill-opacity=".33"/>',
      f: '<ellipse cx="19" cy="21" rx="7" ry="12" transform="rotate(-45 19 21)" fill="currentColor" fill-opacity=".3"/><ellipse cx="45" cy="21" rx="7" ry="12" transform="rotate(45 45 21)" fill="currentColor" fill-opacity=".3"/><ellipse cx="19" cy="43" rx="7" ry="12" transform="rotate(45 19 43)" fill="currentColor" fill-opacity=".3"/><ellipse cx="45" cy="43" rx="7" ry="12" transform="rotate(-45 45 43)" fill="currentColor" fill-opacity=".3"/><circle cx="32" cy="32" r="4" fill="currentColor" fill-opacity=".7"/>',
    };
    return `<svg viewBox="0 0 64 64" role="img" aria-label="Orbital ${block}, dạng ${label}">${shapes[block] ?? shapes.s}</svg>`;
  }

  function property(label, value, options = {}) {
    const { sub = '', accent = false, small = false } = options;
    const classes = ['property-value', accent ? 'accent' : '', small ? 'small' : ''].filter(Boolean).join(' ');
    return `<div class="property"><span class="property-label">${escapeHtml(label)}</span><span class="${classes}">${value}</span>${sub ? `<span class="property-sub">${escapeHtml(sub)}</span>` : ''}</div>`;
  }

  function sampleImageCard(element) {
    const image = element.image;
    const fallback = `
      <div class="sample-model" role="img" aria-label="Mô hình 3D minh họa cho ${escapeHtml(element.nameVi)}">
        <span class="sample-model__ring sample-model__ring--a" aria-hidden="true"><i></i></span>
        <span class="sample-model__ring sample-model__ring--b" aria-hidden="true"><i></i></span>
        <span class="sample-model__orb" aria-hidden="true">${escapeHtml(element.symbol)}</span>
        <span class="sample-model__base" aria-hidden="true"></span>
      </div>`;

    if (!image) {
      return `<figure class="sample-card sample-card--model">
        <div class="sample-card__heading"><span class="mini-heading">MÔ HÌNH 3D MINH HỌA</span><span class="sample-kind">DỰNG HÌNH</span></div>
        ${fallback}
        <figcaption class="sample-caption"><strong>Chưa có ảnh mẫu vật công khai</strong><span>Nguyên tố này rất hiếm, phóng xạ mạnh hoặc chỉ tồn tại trong thời gian cực ngắn.</span></figcaption>
      </figure>`;
    }

    const imageUrl = /^https:\/\/(upload\.wikimedia\.org|images-of-elements\.com)\//.test(image.url) ? image.url : '';
    const sourceUrl = /^https:\/\//.test(image.sourceUrl ?? '') ? image.sourceUrl : imageUrl;
    const licenseUrl = /^https:\/\/creativecommons\.org\/licenses\//.test(image.licenseUrl ?? '') ? image.licenseUrl : '';
    const kindLabel = image.kind === 'illustration' ? 'HÌNH MINH HỌA' : 'ẢNH MẪU VẬT';
    return `<figure class="sample-card" data-image-kind="${image.kind}">
      <div class="sample-card__heading"><span class="mini-heading">HÌNH ẢNH NGUYÊN TỐ</span><span class="sample-kind">${kindLabel}</span></div>
      <div class="sample-photo-frame">
        ${fallback}
        <img class="sample-image" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(element.nameVi)} — ${escapeHtml(image.title)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
        <span class="sample-image-overlay">${escapeHtml(element.symbol)}</span>
      </div>
      <figcaption class="sample-caption"><strong>${escapeHtml(image.title)}</strong><details class="sample-credit"><summary>Nguồn &amp; giấy phép</summary><p>${escapeHtml(image.attribution)}</p><a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">Trang ghi nguồn ↗</a><span aria-hidden="true"> · </span><a href="${escapeHtml(imageUrl)}" target="_blank" rel="noreferrer">Ảnh gốc ↗</a>${licenseUrl ? `<span aria-hidden="true"> · </span><a href="${escapeHtml(licenseUrl)}" target="_blank" rel="noreferrer">Điều khoản giấy phép ↗</a>` : ''}</details></figcaption>
    </figure>`;
  }

  function renderProfile(element) {
    const tone = categoryColors[element.category];
    const outerElectrons = element.shells[element.shells.length - 1] ?? 0;
    const massNumber = Math.round(element.mass ?? element.z);
    const neutrons = Math.max(0, massNumber - element.z);
    const shellSummary = element.shells.map((count, index) => `<span class="shell-chip">${shellNames[index] ?? `n${index + 1}`} <span>${count}</span></span>`).join('');
    const oxidation = element.oxidationStates.length ? element.oxidationStates.map(escapeHtml).join(' · ') : 'Chưa xác định';
    const groupValue = element.group ? `Nhóm ${element.group}` : 'Khối f';
    const periodValue = `Chu kỳ ${element.period}`;
    const blockValue = `Khối ${element.block}`;
    const melting = temperatureC(element.meltingK);
    const boiling = temperatureC(element.boilingK);
    const electronConfig = configHtml(element.configuration);
    profileRoot.innerHTML = `
      <div class="profile-visual ${categoryClass[element.category]}">
        <div class="profile-identity">
          <div class="identity-main">
            <div class="profile-symbol" aria-hidden="true">${escapeHtml(element.symbol)}</div>
            <div><h3 class="profile-name">${escapeHtml(element.nameVi)}<span class="profile-name-en">${escapeHtml(element.name)}</span></h3><span class="category-pill">${escapeHtml(element.categoryVi)}</span></div>
          </div>
          <div class="atomic-number-block"><span class="atomic-number-value">${element.z}</span><span class="atomic-number-label">SỐ HIỆU<br>NGUYÊN TỬ</span></div>
        </div>
        <div class="classification-row"><span class="class-chip"><strong>${periodValue}</strong></span><span class="class-chip"><strong>${groupValue}</strong></span><span class="class-chip"><strong>${blockValue}</strong></span></div>
        <figure class="atom-figure">${electronDiagram(element)}<figcaption class="atom-note">Electron chuyển động minh họa · không theo tỉ lệ quỹ đạo thật</figcaption><figcaption class="sr-only">Mô hình nguyên tử 3D minh họa hạt nhân và các lớp electron của ${escapeHtml(element.nameVi)}.</figcaption></figure>
        <div class="shell-summary" aria-label="Số electron trên từng lớp">${shellSummary}</div>
        <div class="structure-facts">
          <div class="structure-fact"><span class="fact-value">${element.z}</span><span class="fact-label">PROTON</span></div>
          <div class="structure-fact"><span class="fact-value">${element.z}</span><span class="fact-label">ELECTRON*</span></div>
          <div class="structure-fact"><span class="fact-value">≈ ${neutrons}</span><span class="fact-label">NƠTRON**</span></div>
        </div>
      </div>
      <div class="profile-data ${categoryClass[element.category]}">
        <div class="data-header"><h3>Thông số nguyên tử &amp; vật lý</h3><span>NGUYÊN TỬ TRUNG HÒA</span></div>
        <div class="configuration-row">
          <div class="configuration-box"><span class="configuration-label">CẤU HÌNH ELECTRON</span><span class="configuration-value">${electronConfig}</span></div>
          ${sampleImageCard(element)}
        </div>
        <div class="property-grid">
          ${property('Electron lớp ngoài cùng', `${outerElectrons} e⁻`, { accent: true, sub: `lớp n = ${element.shells.length}` })}
          ${property('Khối lượng nguyên tử', formatMass(element.mass))}
          ${property('Trạng thái (20 °C)', escapeHtml(element.state), { accent: true })}
          ${property('Độ âm điện (Pauling)', showValue(element.electronegativity), { sub: element.electronegativity == null ? 'chưa xác định' : '' })}
          ${property('Bán kính nguyên tử', showValue(element.radiusPm, ' pm'))}
          ${property('Năng lượng ion hóa I', showValue(element.ionizationEv, ' eV'))}
          ${property('Ái lực electron', showValue(element.electronAffinityEv, ' eV'))}
          ${property('Số oxi hóa', oxidation, { small: true })}
          ${property('Khối lượng riêng', showValue(element.density, ' g/cm³'), { small: true })}
          ${property('Nhiệt độ nóng chảy', melting, { sub: element.meltingK == null ? 'chưa xác định' : `${formatNumber(element.meltingK, 2)} K` })}
          ${property('Nhiệt độ sôi', boiling, { sub: element.boilingK == null ? 'chưa xác định' : `${formatNumber(element.boilingK, 2)} K` })}
          ${property('Phát hiện', escapeHtml(element.discovery))}
        </div>
        <div class="profile-bottom">
          <div class="orbital-card"><div class="mini-heading"><span>HÌNH DẠNG ORBITAL</span><span>${element.block.toUpperCase()}-BLOCK</span></div><div class="orbital-content"><div class="orbital-shape">${orbitalSvg(element.block)}</div><div class="orbital-copy"><strong>${element.block} orbital</strong><small>${({ s: 'dạng cầu', p: 'hai thùy đối xứng', d: 'thường có bốn thùy', f: 'hình dạng phức tạp' })[element.block]}</small><small>Hình minh họa phân lớp đặc trưng.</small></div></div></div>
          <div class="isotope-note"><div class="mini-heading"><span>CẤU TRÚC HẠT NHÂN</span><span>A ≈ ${massNumber}</span></div><p><strong>n⁰ ≈ ${neutrons}</strong> được ước lượng từ số khối gần nhất. Số nơtron thực tế phụ thuộc đồng vị.</p></div>
        </div>
        <div class="source-line"><span>* Số electron của nguyên tử trung hòa. ** Giá trị nơtron chỉ là ước lượng.</span><span>Dữ liệu: <a href="https://pubchem.ncbi.nlm.nih.gov/element/${element.z}" target="_blank" rel="noreferrer">PubChem ↗</a></span></div>
      </div>`;
    const sampleFigure = profileRoot.querySelector('.sample-card:not(.sample-card--model)');
    const sampleImage = sampleFigure?.querySelector('.sample-image');
    if (sampleImage) {
      sampleImage.addEventListener('error', () => {
        sampleFigure.classList.add('is-unavailable');
        sampleFigure.querySelector('.sample-kind').textContent = 'ẢNH KHÔNG TẢI ĐƯỢC';
        sampleFigure.querySelector('.sample-caption > strong').textContent = 'Đang hiển thị mô hình 3D thay cho ảnh';
      }, { once: true });
    }
    profileRoot.style.setProperty('--tone', tone);
    profileRoot.dataset.element = String(element.z);
    byId('profile-heading').textContent = `${element.nameVi} · ${element.symbol}`;
    const tableTile = periodicGrid.querySelector(`[data-z="${element.z}"]`);
    if (tableTile) {
      periodicGrid.querySelectorAll('.element-tile.is-selected').forEach(tile => {
        tile.classList.remove('is-selected');
        tile.setAttribute('aria-pressed', 'false');
      });
      tableTile.classList.add('is-selected');
      tableTile.setAttribute('aria-pressed', 'true');
    }
  }

  function selectElement(element, trigger) {
    lastSelectedTile = trigger;
    renderProfile(element);
    if (!profileDialog.open) profileDialog.showModal();
  }

  function closeProfile() {
    if (profileDialog.open) profileDialog.close();
  }

  closeProfileButton.addEventListener('click', closeProfile);
  profileDialog.addEventListener('click', event => {
    if (event.target === profileDialog) closeProfile();
  });
  profileDialog.addEventListener('close', () => {
    if (lastSelectedTile?.isConnected) lastSelectedTile.focus({ preventScroll: true });
  });

  searchInput.addEventListener('input', updateFilters);
  periodFilter.addEventListener('change', updateFilters);
  groupFilter.addEventListener('change', updateFilters);
  categoryFilter.addEventListener('change', updateFilters);
  resetButton.addEventListener('click', resetFilters);
  document.addEventListener('keydown', event => {
    const target = event.target;
    const isTyping = target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
    if (event.key === '/' && !isTyping) {
      event.preventDefault();
      searchInput.focus();
    } else if (event.key === 'Escape') {
      if (profileDialog.open) return;
      if (document.activeElement === searchInput || searchInput.value || periodFilter.value !== 'all' || groupFilter.value !== 'all' || categoryFilter.value !== 'all') {
        resetFilters();
      }
    }
  });

  initializeFilters();
  createTable();
  updateFilters();
})();
