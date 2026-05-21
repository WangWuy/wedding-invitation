(function(){
  const media = window.__WEDDING_MEDIA__ || {};

  function cleanPath(value){
    return typeof value === "string" ? value.trim() : "";
  }

  function cssUrl(path){
    return `url("${path.replace(/["\\]/g, "\\$&")}")`;
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

  function applyGallery(){
    const items = Array.from(document.querySelectorAll(".gallery-grid .gallery-item"));
    const photos = Array.isArray(media.gallery) ? media.gallery : [];

    items.forEach(function(item, index){
      const entry = photos[index] || {};
      const src = cleanPath(entry.src);
      const placeholder = item.querySelector(".ph");
      const label = placeholder && placeholder.querySelector(".label");

      if(label && typeof entry.label === "string" && entry.label.trim()){
        label.textContent = entry.label.trim();
      }

      if(src){
        if(placeholder) placeholder.style.display = "";
        const probe = new Image();
        probe.onload = function(){
          item.classList.add("has-photo");
          item.style.backgroundImage = cssUrl(src);
          if(placeholder) placeholder.style.display = "none";
        };
        probe.onerror = function(){
          item.classList.remove("has-photo");
          item.style.backgroundImage = "";
          if(placeholder) placeholder.style.display = "";
        };
        probe.src = src;
      } else {
        item.classList.remove("has-photo");
        item.style.backgroundImage = "";
        if(placeholder) placeholder.style.display = "";
      }
    });
  }

  function boot(){
    applyMusic();
    applyCoverPhoto();
    applyGallery();
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
