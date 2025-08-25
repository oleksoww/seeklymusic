// ===== Użytkownicy =====
function getUsers() { return JSON.parse(localStorage.getItem('users') || '[]'); }
function saveUsers(users){ localStorage.setItem('users', JSON.stringify(users)); }

function register(){
    const email=document.getElementById('email').value.trim();
    const password=document.getElementById('password').value.trim();
    const displayName=document.getElementById('displayName').value.trim() || email.split('@')[0];
    const role=document.getElementById('role').value;

    if(!email || !password){ document.getElementById('msg').innerText="Wypełnij email i hasło!"; return;}

    const users = getUsers();
    if(users.find(u => u.email === email)){ document.getElementById('msg').innerText="Ten email już istnieje!"; return;}

    users.push({email,password,displayName,role,profilePic:'default.png'});
    saveUsers(users);
    document.getElementById('msg').innerText="Zarejestrowano! Teraz się zaloguj.";
}

function login(){
    const email=document.getElementById('email').value.trim();
    const password=document.getElementById('password').value.trim();
    if(!email || !password){ document.getElementById('msg').innerText="Wypełnij email i hasło!"; return; }

    const user=getUsers().find(u=>u.email===email && u.password===password);
    if(!user){ document.getElementById('msg').innerText="Błędny email lub hasło"; return; }

    localStorage.setItem('currentUser', JSON.stringify(user));
    document.getElementById('msg').innerText="Zalogowano!";
    checkLogin();
}

// ===== Panel użytkownika =====
function checkLogin(){
    const user=JSON.parse(localStorage.getItem('currentUser'));
    if(user){
        document.getElementById('loginBtn').style.display='none';
        document.getElementById('userPanel').style.display='inline-block';
        document.getElementById('profilePicHeader').src=user.profilePic;
        document.getElementById('displayNameHeader').innerText=user.displayName;
        document.getElementById('displayNameInput').value=user.displayName;

        if(user.role==='creator'){
            document.getElementById('publishForm').style.display='block';
        } else {
            document.getElementById('publishForm').style.display='none';
        }
        document.getElementById('loginForm').style.display='none';
    }
}

function toggleProfileEdit(){
    const panel=document.getElementById('profileEdit');
    panel.style.display = panel.style.display==='none'?'block':'none';
}

function updateProfile(){
    const user=JSON.parse(localStorage.getItem('currentUser'));
    if(!user) return;
    const displayName=document.getElementById('displayNameInput').value || user.displayName;
    const fileInput=document.getElementById('profileFile');
    if(fileInput.files[0]) user.profilePic=URL.createObjectURL(fileInput.files[0]);
    user.displayName=displayName;

    const users=getUsers();
    const idx=users.findIndex(u=>u.email===user.email);
    users[idx]=user;
    saveUsers(users);
    localStorage.setItem('currentUser', JSON.stringify(user));
    checkLogin();
    alert('Profil zaktualizowany!');
}

function logout(){
    localStorage.removeItem('currentUser');
    location.reload();
}

// ===== Utwory =====
function getTracks(){ return JSON.parse(localStorage.getItem('tracks') || '[]'); }
function saveTracks(tracks){ localStorage.setItem('tracks', JSON.stringify(tracks)); }

function publishTrack(){
    const title=document.getElementById('trackTitle').value;
    const author=document.getElementById('trackAuthor').value;
    const fileInput=document.getElementById('trackFile');
    const coverInput=document.getElementById('trackCover');
    const user=JSON.parse(localStorage.getItem('currentUser'));
    if(!fileInput.files[0]){ alert('Wybierz plik audio'); return; }

    const fileURL=URL.createObjectURL(fileInput.files[0]);
    let coverURL='default_cover.png';
    if(coverInput.files[0]) coverURL=URL.createObjectURL(coverInput.files[0]);

    const tracks=getTracks();
    tracks.push({title,author,file:fileURL,cover:coverURL,creator:user.email});
    saveTracks(tracks);
    alert('Utwór opublikowany!');
    renderTracks();
}

function renderTracks(){
    const container=document.getElementById('tracks');
    if(!container) return;
    const query=document.getElementById('search')?.value.toLowerCase() || '';
    container.innerHTML='';
    getTracks().forEach((t,i)=>{
        if(t.title.toLowerCase().includes(query) || t.author.toLowerCase().includes(query)){
            const div=document.createElement('div'); div.className='track';
            div.dataset.index=i;
            div.innerHTML=`<input type="checkbox" class="mixCheckbox">
                <img src="${t.cover}" width="100"><br>
                <strong onclick="playTrack(${i})" style="cursor:pointer;">${t.title}</strong> - ${t.author}`;
            container.appendChild(div);
        }
    });
}

// ===== Odtwarzanie utworu =====
let currentAudio = null;
function playTrack(index){
    const track = getTracks()[index];
    if(currentAudio){ currentAudio.pause(); }
    currentAudio = new Audio(track.file);
    currentAudio.play();
}

// ===== Mix dwóch utworów =====
function mixTracks(){
    const checkboxes = document.querySelectorAll('.mixCheckbox');
    const selectedTracks = [];
    checkboxes.forEach((cb, i) => {
        if(cb.checked) selectedTracks.push(getTracks()[i]);
    });
    if(selectedTracks.length !== 2){ alert("Wybierz dokładnie dwa utwory do mixowania"); return; }

    const container = document.getElementById('mixPlayer');
    container.innerHTML = `
        <h3>Mix: ${selectedTracks[0].title} + ${selectedTracks[1].title}</h3>
        <audio controls autoplay src="${selectedTracks[0].file}"></audio>
        <audio controls autoplay src="${selectedTracks[1].file}"></audio>
    `;
}
