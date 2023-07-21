import axios from 'axios';
import Notiflix from 'notiflix';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '38386406-5744ae5dca70e3cf5c44041b1';

const selectors = {
  form: document.querySelector('#search-form'),
  div: document.querySelector('.gallery'),
  load: document.querySelector('.load-more'),
  sentinel: document.querySelector('.js-sentinel'),
};

selectors.form.addEventListener('submit', onSubmit);
// selectors.load.addEventListener('click', onLoadMore);

function onSubmit(evt) {
  evt.preventDefault();
  selectors.div.innerHTML = '';
  if (selectors.form.elements.searchQuery.value) {
    const q = selectors.form.elements.searchQuery.value;
    console.log(q);
    serviceImages(q)
      .then(data => {
        if (data.hits.length > 0) {
          createMarkup(data);
          // selectors.load.hidden = false;
          observer.observe(selectors.sentinel);
          Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        } else {
          Notiflix.Notify.failure(
            'Sorry, there are no images matching your search query. Please try again.'
          );
          selectors.load.hidden = true;
        }
      })
      .catch(err => console.log(err));
  }
}

let page = 1;

// function onLoadMore() {
//   page += 1;
//   serviceImages(page).then(data => {
//     createMarkup(data);
//   });
// }
async function serviceImages(q, page = 1) {
  const resp = await axios.get(
    `${BASE_URL}?key=${API_KEY}&q=${q}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`
  );
  return resp.data;
}

function createMarkup(data) {
  const markup = data.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
    <div class="photo-card">
<img src="${webformatURL}" alt="${tags}" loading="lazy"/>
    <p class="info-item">
      <b>👍Likes:</b> ${likes}
    </p>
    <p class="info-item">
      <b>👀Views:</b> ${views}
    </p>
    <p class="info-item">
      <b>💬Comments:</b> ${comments}
    </p>
    <p class="info-item">
      <b>✅Downloads:</b> ${downloads}
    </p>
</div>`
    )
    .join('');
  selectors.div.insertAdjacentHTML('beforeend', markup);
}

let options = {
  rootMargin: '200px',
  threshold: 0,
};

let observer = new IntersectionObserver(handlerScroll, options);

function handlerScroll(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;
      serviceImages(page).then(data => {
        createMarkup(data);
      });
    }
  });
}
