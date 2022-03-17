const changeToPage = (url = 'index.html') => {
    const href = location.href;
    location.href = href.substring(0, href.lastIndexOf('jquery/')) + 'jquery/' + url;
}
