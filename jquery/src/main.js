console.log('main');

// todo add li click event
$('ul').on('click', 'li', function(e){
    const page = $(this).attr('page');
    $('#iframe-content').attr('src', page + '.html');
});
