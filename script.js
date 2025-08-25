// ===== Użytkownicy =====
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
}

function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function register() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const users = getUsers();

    if(users.find(u => u.email === email)) {
        document.getElementById('msg').innerText = 'Ten email już istnieje!';
        return;
    }

    users.push({email, password, role, verified: false});
    saveUsers(users);
    document.getElementById('msg').innerText = 'Zarejestrowano!';
}

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        document.getElementById('msg').innerText = 'Zalogowano jako ' + user.role;
    } else {
        document.getElementById('msg').innerText = 'Błędny email lub hasło';
    }
}

// ===== Utwory =====
function getTracks() {
    return JSON.parse(localStorage.getItem('tracks') || '[]');
}

function saveTracks(tracks) {
    localStorage.setItem('tracks', JSON.stringify(tracks));
}

function renderTracks() {
    const container = document.getElementById('tracks');
    if(!container) return;
    const tracks = getTracks();
    const query = document.getElementById('search').value.toLowerCase();
    container.innerHTML = '';
    tracks.filter(t => t.title.toLowerCase().includes(query) || t.author.toLowerCase().includes(query))
          .forEach((t, i) => {
        const div = document.createElement('div');
        div.className = 'track';
        div.innerHTML = `
            <strong>${t.title}</strong> - ${t.author}<br>
            <audio controls src="${t.file}"></audio><br>
            <button class="mixBtn" onclick="mixTrack(${i})">Miksuj</button>
        `;
        container.appendChild(div);
    });
}

function addTrack() {
    const title = document.getElementById('trackTitle').value;
    const author = document.getElementById('trackAuthor').value;
    const fileInput = document.getElementById('trackFile');
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if(!fileInput.files[0]) return alert('Wybierz plik!');
    const file = URL.createObjectURL(fileInput.files[0]);

    const tracks = getTracks();
    tracks.push({title, author, file, creator: user.email});
    saveTracks(tracks);
    alert('Dodano utwór!');
    renderCreatorTracks();
    renderTracks();
}

// ===== Panel twórcy =====
function renderCreatorTracks() {
    const container = document.getElementById('creatorTracks');
    if(!container) return;
    const user = JSON.parse(localStorage.getItem('currentUser'));
    container.innerHTML = '';
    getTracks().filter(t => t.creator === user.email)
        .forEach(t => {
            const div = document.createElement('div');
            div.className = 'track';
            div.innerHTML = `<strong>${t.title}</strong> - ${t.author}<br>
                             <audio controls src="${t.file}"></audio>`;
            container.appendChild(div);
        });
}

// ===== Miksowanie dwóch utworów =====
let mixBuffer = [];
function mixTrack(index) {
    const tracks = getTracks();
    const t = tracks[index];
    mixBuffer.push(t.file);
    if(mixBuffer.length > 2) mixBuffer.shift(); // tylko dwa utwory
    if(mixBuffer.length === 2) playMix();
}

function playMix() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    Promise.all(mixBuffer.map(f => fetch(f).then(r => r.arrayBuffer())))
        .then(buffers => Promise.all(buffers.map(b => audioContext.decodeAudioData(b))))
        .then(decoded => {
            const sources = decoded.map(d => {
                const src = audioContext.createBufferSource();
                src.buffer = d;
                src.connect(audioContext.destination);
                return src;
            });
            sources.forEach(s => s.start());
        });
}
