const API_KEY = '3ecab21081541b994be53f6076bcf782';

let movieForm = document.getElementById("form");
let moviesGrid = document.querySelector("#movies-grid")
let searchButton = document.getElementById("search-btn");
let moreButton = document.getElementById("load-more-movies-btn");
let closeButton = document.getElementById("close-search-btn");
let topButton = document.getElementById("top-btn");
let resultsHeader = document.querySelector(".results-header");
let moviePoster = document.querySelector(".movie-poster");
let moviePopup = document.querySelector(".movie-popup");
let results;
let page = 1;
let x = true;


movieForm.addEventListener("submit", (event) => {
    event.preventDefault();
    moviesGrid.innerHTML = ``;
    results = document.querySelector('input').value;
    page = 1;
    searchMovies(results);
    resultsHeader.textContent = "Results for '" + results + "'";
    closeButton.style.display = "flex";
});

moreButton.addEventListener("click", () => {
    page++;
    if (x) {
        loadNowPlaying(results);
    } else {
        searchMovies(results);
    }
    closeButton.style.display = "flex";
});

closeButton.addEventListener("click", (event) => {
    event.preventDefault();
    moviesGrid.innerHTML = ``;
    page = 1;
    x = true;
    loadNowPlaying();
    resultsHeader.textContent = "Now Playing";
    closeButton.style.display = "none";
    movieForm.reset();
});

topButton.addEventListener("click", () => {
    document.documentElement.scrollTo({
        top:0,
        behavior: "smooth"
    });
});


async function loadNowPlaying() {
    let response = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en-US&page=${page}`);
    let responseData = await response.json();

    for (let i=0;i<responseData.results.length;i++) {
        displayResults(responseData.results[i]);
    }
}

async function searchMovies(event) {
    x = false;
    let response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&page=${page}&include_adult=false&query=${event}`);
    let responseData = await response.json();
    for (let i=0;i<responseData.results.length;i++) {
        displayResults(responseData.results[i]);
    }
}

function displayResults(e) {
    let posterImage = "http://image.tmdb.org/t/p/w500" + e.poster_path;
    moviesGrid.innerHTML += `
        <div class="movie-card">
            <img class="movie-poster" onclick="getMovieInfo(${e.id})" alt="poster for ${e.original_title}" src="${e.poster_path == null ? "placeholder.png" : posterImage}">
            <div class="movie-info">
                <p class="movie-votes">Audience Rating: ${e.vote_average} / 10</p>
                <p class="movie-title">${e.title}</p>
            </div>
        </div>
    `;
}

async function getMovieInfo(event) {
    let movieDetailsResponse = await fetch(`https://api.themoviedb.org/3/movie/${event}?api_key=${API_KEY}&language=en-US`);
    let movieVideoInfoResponse = await fetch(`https://api.themoviedb.org/3/movie/${event}/videos?api_key=${API_KEY}&language=en-US`);
    let movieDetailsData = await movieDetailsResponse.json();
    let movieVideoInfoData = await movieVideoInfoResponse.json();

    moviePopup.style.display = "flex";
    moviePopupWindow(movieDetailsData, movieVideoInfoData);
    
}

function moviePopupWindow(movieDetailsData, movieVideoInfoData) {
    let trailer = movieVideoInfoData.results[0].key;
    for (let i=0;i<movieVideoInfoData.results.length;i++) {
        if (movieVideoInfoData.results[i].name.includes("Official Trailer")) {
            trailer = movieVideoInfoData.results[i].key;
        }
    }

    moviePopup.innerHTML = `
    <div class="video-container">
        <iframe class="video" src="https://www.youtube.com/embed/${trailer}" allow="fullscreen;" allowfullscreen">
        </iframe>
        <div class="movie-info-container">
            <h1>${movieDetailsData.original_title}</h1>
            <p>${movieDetailsData.overview}</p>
            <p>Release Date: ${movieDetailsData.release_date}</p>
            <p>Runtime: ${movieDetailsData.runtime} min</p>
        </div>
    </div>
    `;
}

window.onclick = function(event) {
    if (event.target == moviePopup || document.querySelector(".video-container") == event.target) {
        moviePopup.style.display = "none";
        moviePopup.innerHTML = ``;
    }
  }

window.onload = function () {
    loadNowPlaying();
    closeButton.style.display = "none";
}