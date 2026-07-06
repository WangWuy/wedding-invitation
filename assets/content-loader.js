(function(){
  const media = window.__WEDDING_MEDIA__ || {};

  function cleanPath(value){
    return typeof value === "string" ? value.trim() : "";
  }

  function applyMusic(){
    const audio = document.getElementById("bgAudio");
    if(!audio) return;

    const mp3 = cleanPath(media.music && media.music.mp3);
    const ogg = cleanPath(media.music && media.music.ogg);
    const mp3Source = audio.querySelector('source[type="audio/mpeg"]');
    const oggSource = audio.querySelector('source[type="audio/ogg"]');

    if(mp3 && mp3Source) mp3Source.setAttribute("src", mp3);
    if(ogg && oggSource) oggSource.setAttribute("src", ogg);
    audio.load();
  }

  function applyCoverPhoto(){
    const wrap = document.getElementById("parallaxPhoto");
    if(!wrap) return;

    const src = cleanPath(media.coverPhoto);
    const placeholder = wrap.querySelector(".photo-placeholder");
    const existing = wrap.querySelector(".couple-photo-img");
    if(!src){
      if(existing) existing.remove();
      wrap.classList.remove("has-photo");
      if(placeholder) placeholder.style.display = "";
      return;
    }

    let img = existing;
    if(!img){
      img = document.createElement("img");
      img.className = "couple-photo-img";
      img.alt = "Ảnh cưới";
      wrap.appendChild(img);
    }

    img.onload = function(){
      wrap.classList.add("has-photo");
      if(placeholder) placeholder.style.display = "none";
    };
    img.onerror = function(){
      wrap.classList.remove("has-photo");
      if(placeholder) placeholder.style.display = "";
    };
    img.src = src;
  }

  function setHTML(id, html){
    const el = document.getElementById(id);
    if(el && typeof html === "string" && html.trim()) el.innerHTML = html;
  }

  function applyCoupleNames(){
    const couple = media.couple || {};
    const groom = cleanPath(couple.groomName);
    const bride = cleanPath(couple.brideName);

    if(groom && bride){
      document.title = `${bride} & ${groom} — Thiệp cưới`;
    }

    setHTML("heroBrideName", bride);
    setHTML("heroGroomName", groom);
    setHTML("familyGroomName", groom);
    setHTML("familyBrideName", bride);

    if(groom && bride){
      setHTML("signatureNames", `${bride} &amp; ${groom}`);
    }
  }

  function applyFamily(){
    const family = media.family || {};
    const groom = family.groom || {};
    const bride = family.bride || {};

    setHTML("groomParents", groom.parents);
    setHTML("brideParents", bride.parents);
  }

  function applyEvents(){
    const events = media.events || {};
    const ceremony = events.ceremony || {};
    const reception = events.reception || {};

    if(ceremony.timeLabel || ceremony.dateLabel){
      setHTML("ceremonyTime", `<strong>${ceremony.timeLabel || ""}</strong><br/>${ceremony.dateLabel || ""}`);
    }
    setHTML("ceremonyAddress", ceremony.address);
    if(cleanPath(ceremony.mapUrl)){
      const link = document.getElementById("ceremonyMapLink");
      if(link) link.setAttribute("href", ceremony.mapUrl);
    }

    if(reception.timeLabel || reception.dateLabel){
      setHTML("receptionTime", `<strong>${reception.timeLabel || ""}</strong><br/>${reception.dateLabel || ""}`);
    }
    if(reception.venueName || reception.address){
      setHTML("receptionAddress", `<strong>${reception.venueName || ""}</strong><br/>${reception.address || ""}`);
    }
    if(cleanPath(reception.mapUrl)){
      const link = document.getElementById("receptionMapLink");
      if(link) link.setAttribute("href", reception.mapUrl);
    }
  }

  function applyHeroDate(){
    const heroDate = media.heroDate || {};
    setHTML("heroDate", heroDate.date);
    setHTML("heroWeekday", heroDate.weekday);
  }

  function applyCountdownTarget(){
    const value = cleanPath(media.countdownTarget);
    if(value) window.__WEDDING_COUNTDOWN_TARGET__ = value;
  }

  const GALLERY_PAGE_SIZE = 6;

  function shuffle(list){
    const result = list.slice();
    for(let i = result.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = result[i];
      result[i] = result[j];
      result[j] = tmp;
    }
    return result;
  }

  function buildGalleryItem(entry, index){
    const src = cleanPath(entry.src);
    const label = typeof entry.label === "string" ? entry.label.trim() : "";

    const item = document.createElement("div");
    item.className = "gallery-item";
    item.dataset.index = String(index);

    const ph = document.createElement("div");
    ph.className = "ph";
    ph.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M21 17l-5-5-9 9"/></svg><span class="label"></span>';
    ph.querySelector(".label").textContent = label;
    item.appendChild(ph);

    if(src){
      const img = document.createElement("img");
      img.loading = "lazy";
      img.decoding = "async";
      img.alt = label || "Ảnh cưới";
      img.onload = function(){ item.classList.add("has-photo"); };
      img.onerror = function(){ img.remove(); };
      img.src = src;
      item.appendChild(img);
    }

    item.addEventListener("click", function(){ openLightbox(index); });
    return item;
  }

  function applyGallery(){
    const track = document.getElementById("galleryTrack");
    if(!track) return;
    const photos = shuffle(Array.isArray(media.gallery) ? media.gallery : []);

    track.innerHTML = "";

    for(let pageStart = 0; pageStart < photos.length; pageStart += GALLERY_PAGE_SIZE){
      const page = document.createElement("div");
      page.className = "gallery-page";
      photos.slice(pageStart, pageStart + GALLERY_PAGE_SIZE).forEach(function(entry, offset){
        page.appendChild(buildGalleryItem(entry, pageStart + offset));
      });
      track.appendChild(page);
    }

    setupGalleryNav(track);
    setupLightbox(photos);
  }

  function setupGalleryNav(track){
    const buttons = document.querySelectorAll(".gallery-nav");
    buttons.forEach(function(btn){
      btn.addEventListener("click", function(){
        const dir = Number(btn.dataset.dir) || 0;
        track.scrollBy({ left: dir * track.clientWidth, behavior: "smooth" });
      });
    });
  }

  let lightboxPhotos = [];
  let lightboxIndex = 0;

  function openLightbox(index){
    if(!lightboxPhotos.length) return;
    lightboxIndex = (index + lightboxPhotos.length) % lightboxPhotos.length;
    renderLightbox();
    const lightbox = document.getElementById("lightbox");
    if(lightbox) lightbox.classList.add("open");
  }

  function closeLightbox(){
    const lightbox = document.getElementById("lightbox");
    if(lightbox) lightbox.classList.remove("open");
  }

  function stepLightbox(delta){
    if(!lightboxPhotos.length) return;
    lightboxIndex = (lightboxIndex + delta + lightboxPhotos.length) % lightboxPhotos.length;
    renderLightbox();
  }

  function renderLightbox(){
    const entry = lightboxPhotos[lightboxIndex] || {};
    const img = document.getElementById("lightboxImg");
    const counter = document.getElementById("lightboxCounter");
    if(img){
      img.src = cleanPath(entry.src);
      img.alt = (typeof entry.label === "string" && entry.label.trim()) || "Ảnh cưới";
    }
    if(counter) counter.textContent = (lightboxIndex + 1) + " / " + lightboxPhotos.length;
  }

  function setupLightbox(photos){
    lightboxPhotos = photos;
    if(setupLightbox.bound) return;
    setupLightbox.bound = true;

    const lightbox = document.getElementById("lightbox");
    const closeBtn = document.getElementById("lightboxClose");
    const prevBtn = document.getElementById("lightboxPrev");
    const nextBtn = document.getElementById("lightboxNext");
    if(!lightbox) return;

    closeBtn && closeBtn.addEventListener("click", closeLightbox);
    prevBtn && prevBtn.addEventListener("click", function(){ stepLightbox(-1); });
    nextBtn && nextBtn.addEventListener("click", function(){ stepLightbox(1); });
    lightbox.addEventListener("click", function(e){
      if(e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function(e){
      if(!lightbox.classList.contains("open")) return;
      if(e.key === "Escape") closeLightbox();
      if(e.key === "ArrowLeft") stepLightbox(-1);
      if(e.key === "ArrowRight") stepLightbox(1);
    });
  }

  function boot(){
    applyMusic();
    applyCoverPhoto();
    applyGallery();
    applyCoupleNames();
    applyFamily();
    applyEvents();
    applyHeroDate();
    applyCountdownTarget();
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
