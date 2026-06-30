let searchTimeout = null;

  document.getElementById('f-direccion').addEventListener('input', function () {
    clearTimeout(searchTimeout);
    const q = this.value.trim();
    if (q.length < 4) {
      hideSuggestions();
      return;
    }
    searchTimeout = setTimeout(() => searchAddress(q), 400);
  });

  document.getElementById('f-direccion').addEventListener('blur', function () {
    setTimeout(hideSuggestions, 200);
  });

  async function searchAddress(query) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query + ', Buenos Aires, Argentina')}` +
        `&format=json&addressdetails=1&limit=5&countrycodes=ar`;

      const res  = await fetch(url, {
        headers: { 'Accept-Language': 'es' }
      });
      const data = await res.json();
      showSuggestions(data);
    } catch (e) {
      hideSuggestions();
    }
  }

  function showSuggestions(results) {
    const list = document.getElementById('address-suggestions');
    list.innerHTML = '';

    if (!results.length) {
      hideSuggestions();
      return;
    }

    results.forEach(r => {
      const li = document.createElement('li');
      // Mostramos solo la parte relevante sin "Argentina" al final
      const label = r.display_name.replace(/, Argentina$/, '');
      li.textContent = label;
      li.addEventListener('click', () => selectAddress(r, label));
      list.appendChild(li);
    });

    list.classList.remove('hidden');
  }

  function hideSuggestions() {
    document.getElementById('address-suggestions').classList.add('hidden');
  }

  function selectAddress(result, label) {
    document.getElementById('f-direccion').value = label;
    document.getElementById('f-lat').value = result.lat;
    document.getElementById('f-lng').value = result.lon;

    // Extraer CP si viene en addressdetails
    const cp = result.address?.postcode?.replace(/\s/g, '').substring(0, 4);
    if (cp) {
      document.getElementById('f-cp').value = cp;
      showZoneForCP(parseInt(cp, 10));
    } else {
      // Si no trae CP, estimamos por coordenadas
      estimateZoneByCoords(parseFloat(result.lat), parseFloat(result.lon));
    }

    hideSuggestions();
  }

  /* ── Geolocalización GPS ──────────────────────────────── */
  document.getElementById('btn-gps').addEventListener('click', function () {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }
    this.style.opacity = '0.3';
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        document.getElementById('f-lat').value = lat;
        document.getElementById('f-lng').value = lng;

        // Geocodificación inversa
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
          const res  = await fetch(url, { headers: { 'Accept-Language': 'es' } });
          const data = await res.json();
          const label = data.display_name.replace(/, Argentina$/, '');
          document.getElementById('f-direccion').value = label;

          const cp = data.address?.postcode?.replace(/\s/g, '').substring(0, 4);
          if (cp) {
            document.getElementById('f-cp').value = cp;
            showZoneForCP(parseInt(cp, 10));
          } else {
            estimateZoneByCoords(lat, lng);
          }
        } catch(e) {}

        document.getElementById('btn-gps').style.opacity = '1';
      },
      () => {
        alert('No se pudo obtener la ubicación. Verificá los permisos del navegador.');
        document.getElementById('btn-gps').style.opacity = '1';
      }
    );
  });

  /* ── Zona por CP ──────────────────────────────────────── */
  function showZoneForCP(cp) {
    const badge = document.getElementById('address-zone');
    badge.className = 'address-zone-badge';

    const zone = CP_ZONES[cp];
    if (zone === 1) {
      badge.classList.add('ok');
      badge.innerHTML = '🟢 Zona CABA — entrega en <strong>24 hs hábiles</strong>';
    } else if (zone === 2) {
      badge.classList.add('warn');
      badge.innerHTML = '🟡 GBA 1° cordón — entrega en <strong>48 hs hábiles</strong>';
    } else if (zone === 3) {
      badge.classList.add('slow');
      badge.innerHTML = '🔴 GBA 2° cordón — entrega en <strong>72 hs hábiles</strong>';
    } else {
      badge.classList.add('none');
      badge.innerHTML = '⚠️ Zona fuera de cobertura — te contactaremos para confirmar disponibilidad.';
    }
    badge.classList.remove('hidden');
  }

  /* ── Fallback: zona por coordenadas si no hay CP ─────── */
  function estimateZoneByCoords(lat, lng) {
    // CABA aprox
    if (lat > -34.706 && lat < -34.527 && lng > -58.460 && lng < -58.335) {
      showZoneForCP(1200); // CP CABA genérico
    }
    // GBA 1°
    else if (lat > -34.870 && lat < -34.470 && lng > -58.650 && lng < -58.140) {
      showZoneForCP(1700); // CP GBA1 genérico
    }
    // GBA 2°
    else if (lat > -35.200 && lat < -34.340 && lng > -59.000 && lng < -57.800) {
      showZoneForCP(1900); // CP GBA2 genérico
    } else {
      showZoneForCP(9999); // fuera de cobertura
    }
  }

  /* ── Submit ───────────────────────────────────────────── */
  function submitForm() {
    const nombre    = document.getElementById('f-nombre').value.trim();
    const telefono  = document.getElementById('f-telefono').value.trim();
    const email     = document.getElementById('f-email').value.trim();
    const direccion = document.getElementById('f-direccion').value.trim();

    if (!nombre || !telefono || !email || !direccion) {
      showToast('Por favor completá todos los campos obligatorios.');
      return;
    }

    showToast('Procesamiento de pagos en desarrollo');
  }