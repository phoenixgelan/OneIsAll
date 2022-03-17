const login = ({userName, password}) => {
    return userName === 'admin' && password === '123';
}

$('#logIn').on('click', function(){
    const loginInfo = {
        userName: $('#userName').val().trim(),
        password: $('#password').val().trim()
    }

    if (login(loginInfo)) {
        changeToPage('pages/main.html');
    }
})
