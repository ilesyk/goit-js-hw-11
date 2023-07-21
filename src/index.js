import axios from 'axios';
import Notiflix from 'notiflix';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '38386406-5744ae5dca70e3cf5c44041b1';

const selectors = {
  form: document.querySelector('#search-form'),
  div: document.querySelector('.gallery'),
  sentinel: document.querySelector('.js-sentinel'),
};

selectors.form.addEventListener('submit', onSubmit);

let searchQ = '';
let currentPage = 1;
let allImages = [];

function onSubmit(evt) {
  evt.preventDefault();
  selectors.div.innerHTML = '';
  if (selectors.form.elements.searchQuery.value) {
    searchQ = selectors.form.elements.searchQuery.value;
    currentPage = 1;
    serviceImages(searchQ, currentPage)
      .then(data => {
        if (data.hits.length > 0) {
          allImages = data.hits;
          createMarkup(allImages);
          observer.observe(selectors.sentinel);
          Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        } else {
          Notiflix.Notify.failure(
            'Sorry, there are no images matching your search query. Please try again.'
          );
        }
      })
      .catch(err => {
        console.log(err);
        Notiflix.Notify.failure(
          'Failed to fetch images. Please try again later.'
        );
      });
  }
}

async function serviceImages(q, page) {
  const resp = await axios.get(
    `${BASE_URL}?key=${API_KEY}&q=${q}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`
  );
  return resp.data;
}

function createMarkup(images) {
  const markup = images
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
      currentPage += 1;
      serviceImages(searchQ, currentPage)
        .then(({ hits, totalHits }) => {
          allImages.push(...hits);
          createMarkup(hits);
            console.log(allImages);
            if (allImages.length >= totalHits) {
                observer.unobserve(entry.target);
                Notiflix.Notify.info(
                  "We're sorry, but you've reached the end of search results."
                );
            }
        })
        .catch(err => {
          console.log(err);
          observer.unobserve(entry.target);
          Notiflix.Notify.failure(
            'Failed to fetch images. Please try again later.'
          );
        });
    }
  });
}
