(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = value => JSON.parse(JSON.stringify(value ?? null));
  const getCharacter = id => state.characters.find(character => character.id === id);
  let selectedId = getCharacter(state.activeId)?.id || state.characters[0]?.id || '';
  let internalSelection = false;

  function selected() {
    return getCharacter(selectedId) || getCharacter(state.activeId) || state.characters[0];
  }

  function makeIndependent(character) {
    if (!character) return character;
    character.tastes = [...(character.tastes || [])];
    character.interests = [...(character.interests || [])];
    character.hobbies = [...(character.hobbies || [])];
    character.settings = { ...(character.settings || {}) };
    character.routines = (character.routines || Array.from({ length: 7 }, () => []))
      .map(day => day.map(item => ({ ...item })));
    const raw = typeof character.theme === 'string'
      ? { accent: character.theme }
      : { ...(character.theme || {}) };
    character.theme = {
      accent: raw.accent || '#6f7cff',
      secondary: raw.secondary || raw.accent || '#6f7cff',
      ring: raw.accent || '#6f7cff',
      useSecondary: Boolean(raw.useSecondary)
    };
    return character;
  }

  state.characters.forEach(makeIndependent);

  function themeOf(character) {
    return makeIndependent(character).theme;
  }

  function applyTheme(character = selected()) {
    if (!character) return;
    const theme = themeOf(character);
    const secondary = theme.useSecondary ? theme.secondary : theme.accent;
    const root = document.documentElement;
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent2', secondary);
    root.style.setProperty('--char-accent', theme.accent);
    root.style.setProperty('--char-secondary', secondary);
    root.style.setProperty('--char-ring', theme.accent);
    $('meta[name="theme-color"]')?.setAttribute('content', theme.accent);
  }

  function commitSelection(character) {
    if (!character) return;
    selectedId = character.id;
    internalSelection = true;
    state.activeId = character.id;
    internalSelection = false;
    applyTheme(character);
    save?.();
  }

  function characterForElement(element, selector) {
    const id = element?.dataset?.characterId;
    if (id && getCharacter(id)) return getCharacter(id);
    const index = $$(selector).indexOf(element);
    return state.characters[index] || null;
  }

  function showCharacterEditor(character) {
    commitSelection(character);
    $$('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.view === 'characters'));
    $$('.view').forEach(view => view.classList.toggle('active', view.id === 'view-characters'));
    renderAll?.();
    commitSelection(character);
    fillForm?.();
    repairSelectionUI();
  }

  function showCharacterLocation(character) {
    commitSelection(character);
    const now = new Date();
    const event = currentEvent?.(character, now.getHours() * 60 + now.getMinutes());
    const atHome = !event || event.home || event.kind === 'home' ||
      /집|귀가|취침|기상|하루 정리/.test(`${event.title || ''} ${event.detail || ''}`);
    if (atHome) {
      $('.tab[data-view="home"]')?.click();
    } else {
      const building = window.ParallelCityVillage?.currentBuilding?.(character);
      if (building && state.worlds) {
        state.worlds.activeWorldId = building.worldId;
        state.worlds.activeDistrictId = building.districtId;
        state.worlds.activeNeighborhoodId = building.neighborhoodId;
      }
      $('.tab[data-view="observe"]')?.click();
      window.ParallelCityVillage?.render?.();
    }
    commitSelection(character);
    renderAll?.();
    repairSelectionUI();
  }

  function updateCharacterFromForm() {
    const character = selected();
    if (!character) return;
    makeIndependent(character);
    const read = id => $(id)?.value ?? '';
    character.name = read('#charName').trim() || character.name || '이름 없음';
    character.job = read('#charJob').trim();
    character.mood = read('#charMood') || character.mood;
    character.income = read('#charIncome') || character.income;
    character.spending = read('#charSpending') || character.spending;
    character.rhythm = read('#charRhythm') || character.rhythm;
    character.transport = read('#charTransport') || character.transport;
    character.homeType = read('#charHomeType') || character.homeType;
    character.pet = read('#charPet') || character.pet;
    character.photoPosition = {
      x: Number(read('#photoPositionX') || 50),
      y: Number(read('#photoPositionY') || 50)
    };
    const accent = read('#charAccent') || themeOf(character).accent;
    const useSecondary = Boolean($('#charUseSecondary')?.checked);
    character.theme = {
      accent,
      secondary: useSecondary ? (read('#charSecondary') || accent) : accent,
      ring: accent,
      useSecondary
    };
    applyTheme(character);
    state.pendingCloudSave = true;
    save?.();
  }

  function toggleChip(chip) {
    const character = selected();
    const box = chip.closest('.chips');
    if (!character || !box) return;
    makeIndependent(character);
    const key = box.id === 'tasteChips' ? 'tastes'
      : box.id === 'interestChips' ? 'interests' : 'hobbies';
    const value = chip.textContent.trim();
    const values = [...character[key]];
    const index = values.indexOf(value);
    if (index >= 0) values.splice(index, 1);
    else values.push(value);
    character[key] = values;
    chip.classList.toggle('selected', index < 0);
    state.pendingCloudSave = true;
    save?.();
  }

  function repairSelectionUI() {
    const character = selected();
    if (!character) return;
    if (state.activeId !== character.id) {
      internalSelection = true;
      state.activeId = character.id;
      internalSelection = false;
    }
    $$('#characterList .char-item').forEach((row, index) => {
      const item = state.characters[index];
      if (!item) return;
      row.dataset.characterId = item.id;
      row.classList.toggle('active', item.id === character.id);
      row.style.setProperty('--char-ring', themeOf(item).accent);
    });
    $$('#observeCharacterPicker .observe-character-card').forEach((row, index) => {
      const item = state.characters[index];
      if (!item) return;
      row.dataset.characterId = item.id;
      row.classList.toggle('active', item.id === character.id);
      row.style.setProperty('--card-accent', themeOf(item).accent);
      row.style.setProperty('--card-ring', themeOf(item).accent);
    });
    if ($('#quickChar')) $('#quickChar').value = character.id;
    applyTheme(character);
  }

  window.addEventListener('pointerdown', event => {
    const editorRow = event.target.closest('#characterList .char-item');
    if (editorRow && !event.target.closest('.char-order')) {
      const character = characterForElement(editorRow, '#characterList .char-item');
      if (character) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showCharacterEditor(character);
      }
      return;
    }
    const observeRow = event.target.closest('#observeCharacterPicker .observe-character-card');
    if (observeRow) {
      const character = characterForElement(observeRow, '#observeCharacterPicker .observe-character-card');
      if (character) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showCharacterLocation(character);
      }
    }
  }, true);

  window.addEventListener('click', event => {
    const chip = event.target.closest('#tasteChips .chip,#interestChips .chip,#hobbyChips .chip');
    if (chip) {
      event.preventDefault();
      event.stopImmediatePropagation();
      toggleChip(chip);
      return;
    }
    if (event.target.closest('#saveChar')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      updateCharacterFromForm();
      const character = selected();
      renderAll?.();
      commitSelection(character);
      fillForm?.();
      window.pushParallelCityCloudState?.();
      toast?.('캐릭터를 저장했습니다.');
    }
  }, true);

  window.addEventListener('change', event => {
    if (event.target.id === 'quickChar') {
      const character = getCharacter(event.target.value);
      if (character) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showCharacterLocation(character);
      }
    }
  }, true);

  window.addEventListener('input', event => {
    if (!['charAccent', 'charSecondary', 'charUseSecondary'].includes(event.target.id)) return;
    updateCharacterFromForm();
    applyTheme(selected());
  }, true);

  // 현실 지도/Google Places 기능을 완전히 끕니다.
  window.loadGooglePlaces = async () => null;
  window.resolveRealEventPlace = async (_character, event) => event;
  window.resolveRealPlacesForDay = async (_character, list) => list;
  window.updateCurrentPlacePhoto = () => {
    const figure = $('#activityPlacePhoto');
    if (figure) figure.style.display = 'none';
  };

  function sanitizeVirtualEvents() {
    state.observationMode = 'virtual';
    for (const character of state.characters || []) {
      character.home = '';
      character.location = null;
      for (const event of character.today || []) {
        if (event.kind === 'home' || event.home) {
          delete event.place;
          delete event.placeName;
          delete event.placeAddress;
          delete event.loc;
          continue;
        }
        window.ParallelCityVillage?.assignEvent?.(
          character,
          event,
          character.today.indexOf(event)
        );
        const building = window.ParallelCityVillage?.locate?.(
          event.villageBuildingId || event.place?.villageBuildingId
        );
        if (!building) continue;
        const companion = event.togetherWith
          ? getCharacter(event.togetherWith)?.name
          : '';
        const action = event.meal === 'lunch' ? '에서 점심'
          : event.meal === 'dinner' ? '에서 저녁 식사'
          : /일|근무|출근/.test(event.title || '') && building.type === 'company'
            ? '에서 일하는 중' : ' 방문';
        event.title = `${companion ? `${companion}와 함께 ` : ''}${building.name}${action}`;
        event.detail = building.description || `${building.name}에서 시간을 보내는 중`;
        event.place = {
          name: building.name,
          villageBuildingId: building.id
        };
        delete event.place.address;
        delete event.place.googleMapsURI;
        delete event.place.photo;
        delete event.placeAddress;
        delete event.loc;
      }
    }
  }

  function removeLegacyRealityUI() {
    $('#activityPlacePhoto')?.remove();
    const work = $('#charWork');
    if (work) work.closest('div')?.remove();
    $$('.section').forEach(section => {
      if (/Google Places|Google 실제 장소|실제 장소 연결/.test(section.textContent || '')) {
        section.style.display = 'none';
      }
    });
  }

  const originalRenderAll = window.renderAll;
  if (typeof originalRenderAll === 'function') {
    window.renderAll = function (...args) {
      const character = selected();
      if (character) {
        internalSelection = true;
        state.activeId = character.id;
        internalSelection = false;
      }
      const result = originalRenderAll.apply(this, args);
      repairSelectionUI();
      removeLegacyRealityUI();
      return result;
    };
  }

  const observer = new MutationObserver(() => {
    repairSelectionUI();
    removeLegacyRealityUI();
  });

  sanitizeVirtualEvents();
  save?.();
  removeLegacyRealityUI();
  repairSelectionUI();
  observer.observe(document.body, { childList: true, subtree: true });
  addEventListener('pageshow', () => {
    removeLegacyRealityUI();
    repairSelectionUI();
  });
})();
