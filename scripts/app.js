const baseUrl    = 'https://asel-express-polling.herokuapp.com';

let newPostId    = 0;
let latePostId   = 0;

const rootEl     = document.getElementById('root');
const formEl     = document.createElement('form');
formEl.className = `form-inline mt-4 justify-content-center`;

formEl.innerHTML = `
    <div class="form-group">   
        <input class="form-control" data-type="content" placeholder="Введите текст">
    </div>
    <div class="form-group">
        <select class="form-control" data-type="type">
            <option>Обычный</option>
            <option>Изображение</option>
            <option>Видео</option>
            <option>Аудио</option>
        </select>
    </div>
    <button class="btn btn-primary" data-type="button">Добавить</button>
`;



const contentEl = formEl.querySelector('[data-type=content]');
contentEl.value = localStorage.getItem('content');
contentEl.addEventListener('input', e => localStorage.setItem('content', e.currentTarget.value))
const typeEl    = formEl.querySelector('[data-type=type]');
typeEl.value    = localStorage.getItem('type');
typeEl.addEventListener('input', e    => localStorage.setItem('type', e.currentTarget.value))


const addNewPostButtonEl = formEl.querySelector('[data-type=button]');
addNewPostButtonEl.addEventListener('click', e => {
    e.preventDefault();
    const content = contentEl.value;
    const type    = typeEl.value;
    const data    = {
        content,
        type,
        likes: 0,
    };
    fetch(`${baseUrl}/posts`, {
        body   : JSON.stringify(data),
        headers: { "Content-Type": 'application/json' },
        method : 'POST'
    })
    .then(
        response  => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
    .then(
        data      => {
            contentEl.value = '';
            typeEl.value    = 'Обычный';
            contentEl.focus();
            localStorage.clear();
            newPostsRender(data);
        })
    .catch(error => console.log(error));

})

rootEl.appendChild(formEl);


const addNewPostsButtonEl     = document.createElement('button');
addNewPostsButtonEl.className = 'btn btn-info mx-auto mt-2 mb-2 d-none';
addNewPostsButtonEl.innerHTML = `Показать новые посты <span class="badge badge-light">1</span>`;
addNewPostsButtonEl.addEventListener('click', () => {
    addNewPostsButtonEl.classList.remove('d-block');
    addNewPostsButtonEl.classList.add('d-none');
    addNewPosts();
});
rootEl.appendChild(addNewPostsButtonEl);


const postsEl = document.createElement('div');
rootEl.appendChild(postsEl);

const addLatePostsButtonEl     = document.createElement('button');
addLatePostsButtonEl.className = 'btn btn-info mx-auto mt-2 d-block';
addLatePostsButtonEl.innerHTML = 'Загрузить еще';
addLatePostsButtonEl.addEventListener('click', addLatePosts)
rootEl.appendChild(addLatePostsButtonEl);

function addLatePosts() {
    fetch(`${baseUrl}/posts/latePosts/${latePostId}`)
        .then(
            response   => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            }
        ).then(data    => latePostsRender(data)
        ).catch(error  => console.log(error));
}

function addNewPosts() {
    fetch(`${baseUrl}/posts/newPosts/${newPostId}`)
        .then(
            response   => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
        .then(data      =>  newPostsRender(data))
        .catch(error    => console.log(error));
}

function latePostsRender(data) {
    data.sort((a, b) => b.likes - a.likes);

    if (data.length < 5) {
        addLatePostsButtonEl.classList.add('d-none');
        addLatePostsButtonEl.classList.remove('d-block');
        if (data.length === 0) {
            return;
        }
    } else {
        fetch(`${baseUrl}/posts/latePostsLoading/${data[data.length - 1].id}`)
            .then(
                response => {
                    if (!response.ok) {
                        throw new Error(response.statusText);
                    }
                    return response.text();
                },
            ).then(
                data => {
                    if (data === 'true') {
                        addLatePostsButtonEl.classList.add('d-none');
                        addLatePostsButtonEl.classList.remove('d-block');
                    };
                }
            ).catch(error => console.log(error))
    }

    if (newPostId === 0) {
        newPostId = data[0].id;
    }
    latePostId = data[data.length - 1].id;

    for (const item of data) {
        postsEl.appendChild(addPost(item));
    }
}

function newPostsRender(data) {
    if (data.length === 0) {
        return;
    }
    if (Array.isArray(data)) {
        data.sort((a, b) => b.likes - a.likes);
        newPostId = data[0].id;
        for (const item of data) {
            postsEl.insertBefore(addPost(item), postsEl.children[0]);
        }
    } else {
        newPostId = data.id;
        postsEl.insertBefore(addPost(data), postsEl.children[0]);
    }
}

function addPost(item) {

    const postEl = document.createElement('div');
    postEl.className = 'card mt-3 w-50 mx-auto justify-content-center';

    if (item.type === 'Обычный') {
        postEl.innerHTML = `
            <div class="card border-info justify-content-center">
                <div class="card-body">
                    <p class="card-text size">${item.content}</p>
                    <button data-action="like" class="btn btn-light">♡ ${item.likes}</button>
                    <button data-action="dislike" class="btn btn-light">👎</button>
                    <button data-action="delete" class="btn btn-danger">Удалить пост</button>
                    <button class="btn-photo"><img src="icons/4.png" alt="" width="30"></button>
                    <button class="btn-video"><img src="icons/3.png" alt="" width="30"></button>

                    <hr>
                    <input type="password" class="form-control" id="comments" placeholder="Добавьте комментарий">
                </div>
            </div>
    
       `;
    } else if (item.type === 'Изображение') {
        postEl.innerHTML = `
            <div class="card border-info">
                <img src="${item.content}" class="card-img-top">
                <div class="card-body">
                    <button data-action="like" class="btn btn-light">♡ ${item.likes}</button>
                    <button data-action="dislike" class="btn btn-light">👎</button>
                    <button data-action="delete" class="btn btn-danger">Удалить пост</button>
                    <button class="btn-photo"><img src="icons/4.png" alt="" width="30"></button>
                    <button class="btn-video"><img src="icons/3.png" alt="" width="30"></button>

                    
                    <hr>
                    <input type="password" class="form-control" id="comments" placeholder="Добавьте комментарий">
                </div>
            </div>
       `;
    } else if (item.type === 'Видео') {
        postEl.innerHTML = `
            <div class="card border-info">
                <div class="card-img-top embed-responsive embed-responsive-16by9">
                    <video src="${item.content}" controls=""></video>
                </div>
                <div class="card-body">
                    <button data-action="like" class="btn btn-light">♡ ${item.likes}</button>
                    <button data-action="dislike" class="btn btn-light">👎</button>
                    <button data-action="delete" class="btn btn-danger">Удалить пост</button>
                    <button class="btn-photo"><img src="icons/4.png" alt="" width="30"></button>
                    <button class="btn-video"><img src="icons/3.png" alt="" width="30"></button> 
                    <hr>
                    <input type="password" class="form-control" id="comments" placeholder="Добавьте комментарий">
                </div>
            </div>
       `;
    } else if (item.type === 'Аудио') {
        postEl.innerHTML = `
            <div class="card border-info">
                <audio controls="" class="card-img-top" src="${item.content}"></audio>
                <div class="card-body">
                    <button data-action="like" class="btn btn-light">♡ ${item.likes}</button>
                    <button data-action="dislike" class="btn btn-light">👎</button>
                    <button data-action="delete" class="btn btn-danger">Удалить пост</button>
                    <button class="btn-photo"><img src="icons/4.png" alt="" width="30"></button>
                    <button class="btn-video"><img src="icons/3.png" alt="" width="30"></button>                
                    <hr>
                    <input type="text" class="form-control" id="comments" placeholder="Добавьте комментарий">
                </div>
            </div>
       `;
    }

    const likeButtonEl = postEl.querySelector('[data-action=like]');

    postEl.addEventListener('click', e => {
        if (e.target.dataset.action === 'like') {
            fetch(`${baseUrl}/posts/like/${item.id}`, {
                method: 'POST'
            })
            .then(
                response => {
                    if (!response.ok) {
                        throw new Error(response.statusText)}
                    return response.text()})
            .then(data   => likeButtonEl.innerHTML = `♡ ${data}`)
            .catch(error => console.log(error))
           
        } else if (e.target.dataset.action === 'dislike') {
            fetch(`${baseUrl}/posts/dislike/${item.id}`, {
                method: 'POST'
            }).then(
                response => {
                    if (!response.ok) {
                        throw new Error(response.statusText);
                    }
                    return response.text();
                },
            ).then(
                data => {
                 likeButtonEl.innerHTML = `♡ ${data}`;
                }
            ).catch(error => console.log(error))
        } else if (e.target.dataset.action === 'delete') {
            fetch(`${baseUrl}/posts/${item.id}`, {
                method: 'DELETE'
            }).then(
                response => {
                    if (!response.ok) {
                        throw new Error(response.statusText);
                    }
                },
            ).catch(error => {
                console.log(error);
            });
            postsEl.removeChild(postEl);
        }
    });
    return postEl;
}


addLatePosts();




setInterval(() => {
    fetch(`${baseUrl}/posts/newPostsLoading/${newPostId}`)
        .then(
            response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.text();
            }
        ).then(
            data => {
                if (data === 'false') {
                return;
                }
                addNewPostsButtonEl.classList.remove('d-none');
                addNewPostsButtonEl.classList.add('d-block');
            }
        ).catch(error => console.log(error));
}, 3000)




