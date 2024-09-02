fetch('http://localhost:3002/api/genres/find?genreName=str', {
    method: 'GET',
    mode: 'same-origin',
}).then((res) => {
    res.json().then(console.log)
})
