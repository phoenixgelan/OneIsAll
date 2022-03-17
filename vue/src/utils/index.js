const checkLogin = ({userName, password}) => {
    return userName === 'admin' && password === '123';
}

export default {
    checkLogin
}
