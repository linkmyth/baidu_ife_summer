function getElementsByClassName(classname, node) {
    if (node == null) node = document;
    if (node.getElementsByClassName) {
        return node.getElementsByClassName(classname);
    } else {
        var results= new Array();
        var elements = node.getElementsByTagName("*");
        var flag, classArr;
        for (var i = 0; i < elements.length; i++) {
            flag = true;
            classArr = elements[i].className.split(" ");
            if (indexOf(classArr, classname) === -1) flag = false;    
            if (flag) {
                results.push(elements[i]);
            }
        }
    }
    return results;
}
function indexOf(arr, value) {
    if (arr.indexOf) return arr.indexOf(value);
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === value) return i;
    }
    return -1;
}
function addEventListener(target, type, listener) {
    if (target.addEventListener) {
        target.addEventListener(type, listener, false);
    }
    else if (target.attachEvent) {
        target.attachEvent(type, listener);
    }
}
function cancelHandler(e) {
    var e = e || window.event;
    if (e.preventDefault) e.preventDefault();
    if (e.returnValue) e.returnValue = false;
    return false;
}


function parseTemplate(data, tpl) {
    return tpl.replace(/\{\$(\w+)\}/g, function($0, $1) {
        return data[$1];
    });
}
function removeClass(element, class_string) {
    if (element.className === "") return;
    var class_array = element.className.split(" ");
    class_index = indexOf(class_array, class_string);
    if (class_index !== -1) {
        class_array.splice(class_index, 1);
    }
    element.className = class_array.join(" ");
}
function addClass(element, class_string) {
    var class_array = element.className.split(" ");
    class_index = indexOf(class_array, class_string);
    if (class_index === -1) {
        class_array.push(class_string);
    }
    element.className = class_array.join(" ");
}
function simpleCloneObject(obj) {
    var results = {};
    for (key in obj) {
        results[key] = obj[key];
    }
    return results;
}
function read_data(item) {
    var memory = window.localStorage || (window.UserDataStorage && new UserDataStorage()) || new cookieStorage();
    var results = JSON.parse(memory.getItem(item));
    return results;
}
function write_data(item, value) {
    var memory = window.localStorage || (window.UserDataStorage && new UserDataStorage()) || new cookieStorage();
    memory.setItem(item, JSON.stringify(value));
}



function display_notes() {
    var notes = read_data("linkmythNotes");
    var notesString = "";
    for (var i = 0; i < notes.length; i++) {
        notes[i].length = notes[i].articleId.length;
        notesString += parseTemplate(notes[i], '<li data-note-id="{$noteId}">{$noteName} ( {$length} )<span class="edit-note"></span></li>');
    }
    var noteList = getElementsByClassName("note-list")[0];
    noteList.innerHTML = notesString;
}
function display_articles() {
    var notes = read_data("linkmythNotes");
    var articles = read_data("linkmythArticles");
    var noteList = getElementsByClassName("note-list")[0];
    var articleList = getElementsByClassName("article-list")[0];
    var currentNote = getElementsByClassName("current", noteList)[0];
    if (!currentNote) {
        articleList.innerHTML = "";
        return;
    }
    var currentNoteId = currentNote.dataset.noteId;
    var displayArticleIds = [];
    for (var i = 0; i < notes.length; i++) {
        if (notes[i].noteId == currentNoteId) {
            displayArticleIds = notes[i].articleId;
            break;
        }
    }
    var displayArticleInfos = [];
    var articlesString = "";
    if (displayArticleIds.length !== 0) {
        for (var i = 0; i < displayArticleIds.length; i++) {
            for (var j = 0; j < articles.length; j++) {
                if (articles[j].articleId == displayArticleIds[i]) {
                    displayArticleInfos.push(articles[j]);
                    break;
                }
            }
        }
        for (var i = 0; i < displayArticleInfos.length; i++) {
            displayArticleInfos[i].articleContent = marked(displayArticleInfos[i].articleContent).replace(/<[\w\/\-\"\'\s\=]+>/g, "");
            if (displayArticleInfos[i].articleContent.length > 30) {
                displayArticleInfos[i].articleContent = displayArticleInfos[i].articleContent.slice(0, 30);
                displayArticleInfos[i].articleContent += "...";
            }
            articlesString += parseTemplate(displayArticleInfos[i], '<li data-article-id="{$articleId}"><h3>{$articleTitle}</h3><p>{$articleContent}</p></li>');
        }
    } 
    articleList.innerHTML = articlesString;
}
function display_preview() {
    var articles = read_data("linkmythArticles");
    var articleList = getElementsByClassName("article-list")[0]
    var currentArticle = getElementsByClassName("current", articleList)[0];
    var articlePreviewHeader = getElementsByClassName("article-preview-header")[0];
    if (currentArticle) {
        var articleToDisplay = {};
        for (var i = 0; i < articles.length; i++) {
            if (articles[i].articleId == currentArticle.dataset.articleId) {
                articleToDisplay = articles[i];
            }
        }
        articlePreviewHeader.getElementsByTagName("h2")[0].innerHTML = articleToDisplay.articleTitle;
        getElementsByClassName("article-preview-content")[0].innerHTML = marked(articleToDisplay.articleContent);
    }
    else {
        articlePreviewHeader.getElementsByTagName("h2")[0].innerHTML = "";
        getElementsByClassName("article-preview-content")[0].innerHTML = "";
    }
    var articlePreview = getElementsByClassName("article-preview-wrapper")[0];
    var articleEdit = getElementsByClassName("article-edit-wrapper")[0];
    articlePreview.style.display = "block";
    articleEdit.style.display = "none";
}
function display_mask() {
    getElementsByClassName("add-note-mask")[0].style.display = "block";
}


function addNoteHandler(e) {
    var e = e || window.event;
    display_mask();
    cancelHandler(e);
}
function editNote(e) {
    e = e || window.event;
    var notes = read_data("linkmythNotes");
    var tmpNote = {};
    tmpNote.noteId = e.target.parentNode.dataset.noteId;
    for (var i = 0; i < notes.length; i++) {
        if (notes[i].noteId == tmpNote.noteId) {
            tmpNote = notes[i];
        }
    }
    display_mask();
    var addNoteTitle = getElementsByClassName("note-title")[0];
    addNoteTitle.value = tmpNote.noteName;
    addNoteTitle.dataset.noteId = tmpNote.noteId;
    var confirmNote = getElementsByClassName("confirm-note")[0];
    removeClass(confirmNote, "disabled-btn");
    confirmNote.removeAttribute("disabled");
    cancelHandler(e);
}
function deleteNoteHandler(e) {
    var notes = read_data("linkmythNotes");
    var articles = read_data("linkmythArticles");
    var noteList = getElementsByClassName("note-list")[0];
    var currentNote = getElementsByClassName("current", noteList)[0];
    if (currentNote !== null) {
        var noteToDeleteId = currentNote.dataset.noteId;
        for (var i = 0; i < notes.length; i++) {
            if (noteToDeleteId == notes[i].noteId) {
                for (var j = 0; j < notes[i].articleId.length; j++) {
                    for (var k = 0; k < articles.length; k++) {
                        if (articles[k].articleId == notes[i].articleId[j]) {
                            articles.splice(k, 1);
                        }
                    }
                }
                notes.splice(i, 1);
                write_data("linkmythNotes", notes);
                write_data("linkmythArticles", articles);
                display_notes();
                display_articles();
                display_preview();
            }
        }
    }
    cancelHandler(e);
}
function noteTitleChangeHandler(e) {
    var confirmNote = getElementsByClassName("confirm-note")[0];
    var e = e || window.event;
    if (e.target.value !== "") {
        removeClass(confirmNote, "disabled-btn");
        confirmNote.removeAttribute("disabled");
    }
    else {
        addClass(confirmNote, "disabled-btn");
        confirmNote.setAttribute("disabled", "disabled");
    }
}
function confirmNoteHandler(e) {
    var e = e || window.event;
    var notes = read_data("linkmythNotes");
    var tmp_note = {};
    var noteTitle = getElementsByClassName("note-title")[0];
    tmp_note.noteName = noteTitle.value;
    if (noteTitle.dataset.noteId) {
        tmp_note.noteId = noteTitle.dataset.noteId;
        for (var i = 0; i < notes.length; i++) {
            if (notes[i].noteId == tmp_note.noteId) {
                notes[i].noteName = tmp_note.noteName;
            }
        }
        noteTitle.removeAttribute("data-note-id");
    }
    else {
        if (notes.length > 0) {
            tmp_note.noteId = parseInt(notes[notes.length - 1].noteId) + 1;
        } else {
             tmp_note.noteId = 1;
        }
        tmp_note.articleId = [];
        notes.push(tmp_note);
    }
    if (tmp_note.noteName !== "") {
        noteTitle.value = "";
    }
    write_data("linkmythNotes", notes);
    display_notes();
    getElementsByClassName("add-note-mask")[0].style.display = "none";
    var confirmNote = getElementsByClassName("confirm-note")[0];
    addClass(confirmNote, "disabled-btn");
    confirmNote.setAttribute("disabled", "disabled");
    cancelHandler(e);
}
function cancelNoteHandler(e) {
    var e = e || window.event;
    getElementsByClassName("note-title")[0].value = "";
    getElementsByClassName("add-note-mask")[0].style.display = "none";
    var confirmNote = getElementsByClassName("confirm-note")[0];
    addClass(confirmNote, "disabled-btn");
    confirmNote.setAttribute("disabled", "disabled");
    cancelHandler(e);
}
function noteListClickHandler(e) {
    var e = e || window.event;
    var noteListContainer = getElementsByClassName("note-list")[0];
    if (e.target.parentNode.parentNode === noteListContainer) editNote(e); 
    var noteListCurrent = getElementsByClassName("current", noteListContainer)[0];
    if (noteListCurrent) {
        removeClass(noteListCurrent, "current");
    }
    var element = e.target;
    for (; element.parentNode !== noteListContainer && element !== noteListContainer; element = element.parentNode) ;
    addClass(element, "current");
    display_articles();
    display_preview();
}

function editArticleHandler(e) {
    var articles = read_data("linkmythArticles");
    var articlePreview = getElementsByClassName("article-preview-wrapper")[0];
    var articleEdit = getElementsByClassName("article-edit-wrapper")[0];
    var articleList = getElementsByClassName("article-list")[0];
    var currentArticle = getElementsByClassName("current", articleList)[0];
    if (currentArticle) {
        var articleTitle = getElementsByClassName("article-title")[0];
        var articleEditContent = getElementsByClassName("article-edit-content")[0];
        var tmp_article;
        for (var i = 0; i < articles.length; i++) {
            if (articles[i].articleId == currentArticle.dataset.articleId) {
                tmp_article = articles[i];
            }
        }
        articleTitle.dataset.articleId = tmp_article.articleId;
        articleTitle.value = tmp_article.articleTitle;
        articleEditContent.value = tmp_article.articleContent;
        articlePreview.style.display = "none";
        articleEdit.style.display = "block";
    }
    cancelHandler(e);
}
function deleteArticleHandler(e) {
    var articleList = getElementsByClassName("article-list")[0];
    var currentArticle = getElementsByClassName("current", articleList)[0];
    var noteList = getElementsByClassName("note-list")[0];
    var currentNote = getElementsByClassName("current", noteList)[0];
    var currentNoteId = currentNote.dataset.noteId;
     if (currentArticle) {
        var notes = read_data("linkmythNotes");
        var articles = read_data("linkmythArticles");
        var deleteArticleId = parseInt(currentArticle.dataset.articleId);
        for (var i = 0; i < articles.length; i++) {
            if (articles[i].articleId == deleteArticleId) {
                articles.splice(i, 1);
            }
        }
        for (var i = 0; i < notes.length; i++) {
            var index = indexOf(notes[i].articleId, deleteArticleId);
            if (index !== -1) {
                notes[i].articleId.splice(index, 1);
            }
        }
        write_data("linkmythNotes", notes);
        write_data("linkmythArticles", articles);
        display_notes();
        var noteListChildren = noteList.getElementsByTagName("li");
        for (var i = 0; i < noteListChildren.length; i++) {
            if (noteListChildren[i].dataset.noteId == currentNoteId) {
                addClass(noteListChildren[i], "current");
            }
        }
        display_articles();
        display_preview();
    }
    cancelHandler(e);
}
function cancelArticleHandler(e) {
    var articlePreview = getElementsByClassName("article-preview-wrapper")[0];
    var articleEdit = getElementsByClassName("article-edit-wrapper")[0];
    articlePreview.style.display = "block";
    articleEdit.style.display = "none";
    var articleTitle = getElementsByClassName("article-title")[0];
    articleTitle.removeAttribute("data-article-id");
    cancelHandler(e);
}
function articleListClickHandler(e) {
    e = e || window.event;
    var articleList = getElementsByClassName("article-list")[0];
    var currentArticle = getElementsByClassName("current", articleList)[0];
    if (currentArticle) {
        removeClass(currentArticle, "current");
    }
    var element = e.target;
    if (element !== getElementsByClassName("article-list")[0]) {
        for (; element.parentNode !== articleList; element = element.parentNode) ;
        addClass(element, "current");
        display_preview();
    }
    cancelHandler(e);
}
function enterArticleHeaderHandler(e) {
    var articlePreviewWrapper = getElementsByClassName("article-preview-wrapper")[0];
    var buttonWrapper = getElementsByClassName("button-wrapper", articlePreviewWrapper)[0];
    buttonWrapper.style.display = "block";
    cancelHandler(e);
}
function leaveArticleHeaderHandler(e) {
    var articlePreviewWrapper = getElementsByClassName("article-preview-wrapper")[0];
    var buttonWrapper = getElementsByClassName("button-wrapper", articlePreviewWrapper)[0];
    buttonWrapper.style.display = "none";
    cancelHandler(e);
}
function addArticleHandler(e) {
    var noteList = getElementsByClassName("note-list")[0];
    var currentNote = getElementsByClassName("current", noteList)[0];
    if (!currentNote) {
        alert("请先选择笔记本");
        cancelHandler(e);
        return;
    }
    var notes = read_data("linkmythNotes");
    var articles = read_data("linkmythArticles");
    var tmpArticle = {};
    var currentNoteId = currentNote.dataset.noteId;
    if (articles.length > 0) {
        tmpArticle.articleId = parseInt(articles[articles.length - 1].articleId) + 1;
    } else {
        tmpArticle.articleId = 1;
    }
    
    tmpArticle.articleTitle = "";
    tmpArticle.articleContent = "";
    articles.push(tmpArticle);
    for (var i = 0; i < notes.length; i++){
        if (notes[i].noteId == currentNoteId) {
            notes[i].articleId.push(tmpArticle.articleId);
        }
    }
    write_data("linkmythNotes", notes);
    write_data("linkmythArticles", articles);
    display_notes();
    var noteListChildren = noteList.getElementsByTagName("li");
    for (var i = 0; i < noteListChildren.length; i++) {
        if (noteListChildren[i].dataset.noteId == currentNoteId) {
            addClass(noteListChildren[i], "current");
        }
    }
    display_articles();
    var articleList = getElementsByClassName("article-list")[0];
    var articleListChildren = articleList.getElementsByTagName("li");
    for (var i = 0; i < articleListChildren.length; i++) {
        if (articleListChildren[i].dataset.articleId == tmpArticle.articleId) {
            addClass(articleListChildren[i], "current");
        }
    }
    var articleTitle = getElementsByClassName("article-title")[0];
    articleTitle.dataset.articleId = tmpArticle.articleId;
    var articlePreview = getElementsByClassName("article-preview-wrapper")[0];
    var articleEdit = getElementsByClassName("article-edit-wrapper")[0];
    articlePreview.style.display = "none";
    articleEdit.style.display = "block";
    cancelHandler(e);
}
function saveArticleHandler(e) {
    var articles = read_data("linkmythArticles");
    var articleTitle = getElementsByClassName("article-title")[0];
    var articleContent = getElementsByClassName("article-edit-content")[0];
    var tmpArticle = {};
    tmpArticle.articleId = articleTitle.dataset.articleId;
    tmpArticle.articleTitle = articleTitle.value;
    tmpArticle.articleContent = articleContent.value;
    articleTitle.removeAttribute("data-article-id");
    articleTitle.value = "";
    articleContent.value = "";
    for (var i = 0; i < articles.length; i++) {
        if (articles[i].articleId == tmpArticle.articleId) {
            articles[i] = tmpArticle;
        }
    }
    write_data("linkmythArticles", articles);
    display_articles();
    var articleList = getElementsByClassName("article-list")[0];
    var articleListChildren = articleList.getElementsByTagName("li");
    for (var i = 0; i < articleListChildren.length; i++) {
        if (articleListChildren[i].dataset.articleId == tmpArticle.articleId) {
            addClass(articleListChildren[i], "current");
        }
    }
    display_preview();
    cancelHandler(e);
}