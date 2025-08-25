// ===== Użytkownicy =====
function getUsers() { return JSON.parse(localStorage.getItem('users')||'[]'); }
function saveUsers(users){ localStorage.setItem('users',JSON.stringify(users)); }

function register(){
    const email=document.getElementById('email').value;
    const password=document.getElementById('password').value;
    const displayName=document.getElementById('displayName').value||email.split('@')[0];
    const role=document.getElementById('role').value;
    const users=getUsers();
    if(users.find(u=>u.email===email)){ document.getElementById('msg').innerText='Ten email już istnieje!'; return;}
    users.push({email,password,role,displayName,profilePic:'default.png'});
    saveUsers(users);
    document.getElementById('msg').innerText='Zarejestrowano!';
}

function login(){
    const email=document.getElementById('email').value;
    const password=document.getElementById('password').value;
    const user=getUsers().find(u=>u.email===email && u.password===password);
    if(user){ localStorage.setItem('currentUser',JSON.stringify(user)); checkLogin(); }
    else{ document.getElementById('msg').innerText='Błędny email lub hasło'; }
}

function logout(){
    localStorage.removeItem('currentUser');
    location.reload();
}

// ===== Sprawdzenie loginu =====
function checkLogin(){
    const user=JSON.parse(localStorage.getItem('currentUser'));
    if(user){
        document.getElementById('loginBtn').style.display='none';
        document.getElementById('userPanel').style.display='inline-block';
        document.getElementById('profilePicHeader').src=user.profilePic;
        document.getElementById('displayNameHeader').innerText=user.displayName;
        if(user.role==='creator'){
            document.getElementById('publishForm').style.display='block';
        }
    }
}

// ===== Utwory =====
function getTracks(){ return JSON.parse(localStorage.getItem('tracks')||'[]'); }
function saveTracks(tracks){ localStorage.setItem('tracks',JSON.stringify(tracks)); }

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

// ===== Render utworów =====
function renderTracks(){
    const container=document.getElementById('tracks');
    if(!container) return;
    const query=document.getElementById('search')?.value.toLowerCase()||'';
    container.innerHTML='';
    getTracks().filter(t=>t.title.toLowerCase().includes(query) || t.author.toLowerCase().includes(query))
    .forEach((t,i)=>{
        const div=document.createElement('div'); div.className='track';
        div.innerHTML=`<img src="${t.cover}" width="100"><br>
        <strong>${t.title}</strong> - ${t.author}<br>
        <audio controls src="${t.file}"></audio>`;
        container.appendChild(div);
    });
}
