/* =====================================================
   SUPABASE CONFIGURATION
===================================================== */

const SUPABASE_URL =
    "https://brotcqznzuchmqzqevjy.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_UD6-tboqgctR4KEiaEZzcw_8cLyWvNH";


const { createClient } =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   GLOBAL
===================================================== */

let currentUser = null;

const BUCKET = "love-memories";


/* =====================================================
   AUTH
===================================================== */

async function signup(){

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("authMessage");

    if(!email || !password){

        message.innerText =
            "Please enter your email and password 💕";

        return;
    }

    if(password.length < 6){

        message.innerText =
            "Password must contain at least 6 characters.";

        return;
    }


    message.innerText =
        "Creating your little love world... 💗";


    const { data, error } =
        await supabase.auth.signUp({
            email,
            password
        });


    if(error){

        message.innerText =
            error.message;

        return;
    }


    if(data.session){

        currentUser =
            data.user;

        showHome();

    }else{

        message.innerText =
            "Account created! Check your email to confirm it 💌";

    }

}


/* LOGIN */

async function login(){

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("authMessage");


    if(!email || !password){

        message.innerText =
            "Please enter your email and password 💕";

        return;
    }


    message.innerText =
        "Opening our little world... 💕";


    const { data, error } =
        await supabase.auth.signInWithPassword({
            email,
            password
        });


    if(error){

        message.innerText =
            error.message;

        return;
    }


    currentUser =
        data.user;

    showHome();

}


/* LOGOUT */

async function logout(){

    await supabase.auth.signOut();

    currentUser = null;

    document
        .getElementById("homeScreen")
        .classList.add("hidden");

    document
        .getElementById("loginScreen")
        .classList.remove("hidden");

}


/* CHECK SESSION */

async function checkSession(){

    const { data } =
        await supabase.auth.getSession();

    if(data.session){

        currentUser =
            data.session.user;

        showHome();

    }

}


/* AUTH STATE */

supabase.auth.onAuthStateChange(
    (event, session)=>{

        if(session){

            currentUser =
                session.user;

        }

    }
);


/* =====================================================
   SCREEN NAVIGATION
===================================================== */

function hideAllScreens(){

    [
        "homeScreen",
        "lettersScreen",
        "readerScreen",
        "memoryScreen"
    ].forEach(id=>{

        document
            .getElementById(id)
            .classList.add("hidden");

    });

}


function showHome(){

    hideAllScreens();

    document
        .getElementById("homeScreen")
        .classList.remove("hidden");

}


function goHome(){

    hideAllScreens();

    document
        .getElementById("homeScreen")
        .classList.remove("hidden");

}


function openLetters(){

    hideAllScreens();

    document
        .getElementById("lettersScreen")
        .classList.remove("hidden");

}


function openMemories(){

    hideAllScreens();

    document
        .getElementById("memoryScreen")
        .classList.remove("hidden");

    loadMemories();

}


/* =====================================================
   ENVELOPE
===================================================== */

function openEnvelope(){

    const envelope =
        document.getElementById("envelope");

    envelope.classList.add("open");


    setTimeout(()=>{

        openLetters();

    },900);

}


/* =====================================================
   LETTERS
===================================================== */

const letters = [

{
    title:"My Little Love Letter 💌",

    content:`My love,

Sometimes I wonder how one person can make another person's world feel so much brighter.

You are my favorite notification, my favorite conversation and one of my happiest reasons to smile.

Thank you for being you.

I hope this little corner of the internet reminds you that you are deeply loved.

No matter how many memories we make, I hope we always keep making new ones.

With all my heart ❤️`
},

{
    title:"Why I Love You 🌹",

    content:`I love you because...

You make ordinary moments feel special.

You make me laugh when I don't even feel like laughing.

You make simple conversations become memories.

I love your smile.

I love your little habits.

I love our silly moments.

And most importantly...

I love the way being with you feels like home.

There are probably a million reasons I could write here...

But somehow, "I love you" still says the most. 💕`
},

{
    title:"Before You Sleep 🌙",

    content:`Before you close your eyes tonight...

Forget the stressful moments of today.

Take a deep breath.

Smile.

And remember that somewhere, someone is thinking about you.

I hope your dreams are peaceful.

I hope tomorrow brings you beautiful moments.

And I hope I get to be part of many of them.

Good night, my love. 🌙💗`
},

{
    title:"Forever Us 💖",

    content:`I don't know everything that tomorrow will bring.

But I know what I want more of...

More laughs.

More adventures.

More photographs.

More late-night conversations.

More silly moments.

More memories.

More YOU.

Let's keep writing our story one beautiful day at a time.

No perfect story is necessary.

Just our story.

Forever us. 💖`
}

];


function openLetter(index){

    hideAllScreens();

    document
        .getElementById("readerScreen")
        .classList.remove("hidden");


    document
        .getElementById("letterTitle")
        .innerText =
        letters[index].title;


    document
        .getElementById("letterContent")
        .innerText =
        letters[index].content;

}


/* =====================================================
   FILE UPLOAD
===================================================== */

async function uploadFiles(files){

    if(!currentUser){

        showToast(
            "Please login first 💕"
        );

        return;
    }


    if(!files || files.length === 0)
        return;


    const status =
        document.getElementById(
            "uploadStatus"
        );


    for(const file of files){

        try{

            status.innerText =
                `Uploading ${file.name}... 💕`;


            const isImage =
                file.type.startsWith("image/");

            const isVideo =
                file.type.startsWith("video/");


            if(!isImage && !isVideo){

                showToast(
                    "Only photos and videos are allowed."
                );

                continue;
            }


            /*
              Keep files reasonably sized for a simple
              browser upload.
            */

            if(file.size > 100 * 1024 * 1024){

                showToast(
                    `${file.name} is larger than 100MB.`
                );

                continue;
            }


            const extension =
                file.name
                .split(".")
                .pop()
                .toLowerCase();


            const uniqueName =
                `${crypto.randomUUID()}.${extension}`;


            /*
              User's UUID becomes the first folder.
              This matches the Storage RLS policies.
            */

            const path =
                `${currentUser.id}/${uniqueName}`;


            const { error: uploadError } =
                await supabase
                .storage
                .from(BUCKET)
                .upload(
                    path,
                    file,
                    {
                        cacheControl:"3600",
                        upsert:false,
                        contentType:file.type
                    }
                );


            if(uploadError)
                throw uploadError;


            const { error: dbError } =
                await supabase
                .from("memories")
                .insert({

                    user_id:
                        currentUser.id,

                    file_path:
                        path,

                    file_name:
                        file.name,

                    media_type:
                        isImage
                        ? "image"
                        : "video",

                    caption:""

                });


            if(dbError)
                throw dbError;


            showToast(
                "Memory safely saved to the cloud 💕"
            );


        }catch(error){

            console.error(error);

            showToast(
                "Upload failed: " +
                error.message
            );

        }

    }


    status.innerText =
        "All memories are safely stored ☁️💕";


    loadMemories();

}


/* =====================================================
   LOAD MEMORIES
===================================================== */

async function loadMemories(){

    if(!currentUser)
        return;


    const grid =
        document.getElementById(
            "memoryGrid"
        );


    if(!grid)
        return;


    grid.innerHTML = `
        <div class="empty-memory">
            Loading our memories... 💕
        </div>
    `;


    const { data, error } =
        await supabase
        .from("memories")
        .select("*")
        .eq(
            "user_id",
            currentUser.id
        )
        .order(
            "created_at",
            {
                ascending:false
            }
        );


    if(error){

        console.error(error);

        grid.innerHTML = `
            <div class="empty-memory">
                Couldn't load memories 💔
            </div>
        `;

        return;
    }


    if(!data || data.length === 0){

        grid.innerHTML = `
            <div class="empty-memory">
                <div style="font-size:60px">
                    🧸💕
                </div>

                <h3>
                    Our memory garden is waiting...
                </h3>

                <p>
                    Add your first beautiful moment.
                </p>
            </div>
        `;

        return;
    }


    grid.innerHTML = "";


    for(const memory of data){

        await renderMemory(
            grid,
            memory
        );

    }

}


/* =====================================================
   RENDER MEMORY
===================================================== */

async function renderMemory(
    grid,
    memory
){

    /*
      Private bucket:
      Generate a temporary signed URL.
    */

    const { data, error } =
        await supabase
        .storage
        .from(BUCKET)
        .createSignedUrl(
            memory.file_path,
            60 * 60
        );


    if(error){

        console.error(error);

        return;
    }


    const url =
        data.signedUrl;


    const card =
        document.createElement("article");

    card.className =
        "memory-card";


    let mediaHTML = "";


    if(memory.media_type === "image"){

        mediaHTML = `
            <img
                class="memory-media"
                src="${url}"
                alt="Our memory"
                loading="lazy"
                onclick="openViewer('${escapeAttribute(url)}')"
                style="cursor:pointer"
            >
        `;

    }else{

        mediaHTML = `
            <video
                class="memory-media"
                src="${url}"
                controls
                playsinline
            ></video>
        `;

    }


    const date =
        new Date(
            memory.created_at
        ).toLocaleDateString(
            undefined,
            {
                day:"numeric",
                month:"short",
                year:"numeric"
            }
        );


    card.innerHTML = `

        ${mediaHTML}

        <div class="memory-info">

            <div>
                <strong>
                    ${memory.media_type === "image"
                        ? "📸"
                        : "🎥"}
                    Our Memory
                </strong>

                <div class="memory-date">
                    ${date}
                </div>
            </div>

            <button
                class="delete-btn"
                onclick="deleteMemory(
                    '${memory.id}',
                    '${escapeAttribute(memory.file_path)}'
                )">

                🗑️

            </button>

        </div>
    `;


    grid.appendChild(card);

}


/* =====================================================
   DELETE MEMORY
===================================================== */

async function deleteMemory(
    id,
    path
){

    const confirmed =
        confirm(
            "Delete this memory forever? 💔"
        );


    if(!confirmed)
        return;


    try{

        /*
          Delete Storage file first.
        */

        const {
            error:storageError
        } =
            await supabase
            .storage
            .from(BUCKET)
            .remove([path]);


        if(storageError)
            throw storageError;


        /*
          Delete database record.
        */

        const {
            error:dbError
        } =
            await supabase
            .from("memories")
            .delete()
            .eq(
                "id",
                id
            )
            .eq(
                "user_id",
                currentUser.id
            );


        if(dbError)
            throw dbError;


        showToast(
            "Memory deleted 💕"
        );


        loadMemories();


    }catch(error){

        console.error(error);

        showToast(
            "Could not delete memory."
        );

    }

}


/* =====================================================
   REALTIME
===================================================== */

function setupRealtime(){

    if(!currentUser)
        return;


    /*
      Whenever the database changes,
      refresh the gallery.

      This means:
      Phone A uploads
      ↓
      Supabase database changes
      ↓
      Phone B receives the change
      ↓
      Gallery refreshes
    */

    supabase
    .channel(
        "love-memory-changes"
    )
    .on(
        "postgres_changes",
        {
            event:"*",
            schema:"public",
            table:"memories",
            filter:
            `user_id=eq.${currentUser.id}`
        },
        ()=>{
            loadMemories();
        }
    )
    .subscribe();

}


/* =====================================================
   IMAGE VIEWER
===================================================== */

function openViewer(url){

    const viewer =
        document.getElementById(
            "viewer"
        );

    const image =
        document.getElementById(
            "viewerImage"
        );


    image.src = url;

    viewer.classList.remove(
        "hidden"
    );

}


function closeViewer(){

    document
        .getElementById("viewer")
        .classList.add("hidden");

}


/* =====================================================
   TOAST
===================================================== */

function showToast(message){

    const toast =
        document.getElementById(
            "toast"
        );

    toast.innerText =
        message;

    toast.classList.add("show");


    setTimeout(()=>{

        toast.classList.remove(
            "show"
        );

    },3000);

}


/* =====================================================
   SAFE ATTRIBUTE
===================================================== */

function escapeAttribute(value){

    return String(value)
        .replace(/\\/g,"\\\\")
        .replace(/'/g,"\\'")
        .replace(/"/g,"&quot;");

}


/* =====================================================
   FLOATING HEARTS
===================================================== */

function createHeart(){

    const heart =
        document.createElement("div");

    heart.innerText =
        [
            "❤️",
            "💕",
            "💗",
            "💖",
            "💘"
        ][
            Math.floor(
                Math.random()*5
            )
        ];


    heart.style.position =
        "fixed";

    heart.style.left =
        Math.random()*100+"vw";

    heart.style.bottom =
        "-30px";

    heart.style.fontSize =
        (15+Math.random()*20)+"px";

    heart.style.zIndex =
        "1";

    heart.style.pointerEvents =
        "none";


    const duration =
        5+Math.random()*5;

    heart.style.transition =
        `transform ${duration}s linear,
         opacity ${duration}s linear`;

    document.body.appendChild(
        heart
    );


    requestAnimationFrame(()=>{

        heart.style.transform =
            `translateY(-110vh)
             rotate(${Math.random()*360}deg)`;

        heart.style.opacity =
            "0";

    });


    setTimeout(()=>{

        heart.remove();

    },duration*1000);

}


setInterval(
    createHeart,
    700
);


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async ()=>{

        await checkSession();

    }
);


/*
  Set realtime after authentication.
*/

supabase.auth.onAuthStateChange(
    (event, session)=>{

        if(
            session &&
            event === "SIGNED_IN"
        ){

            currentUser =
                session.user;

            setupRealtime();

        }

    }
);
