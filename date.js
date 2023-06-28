const getDate = () => {
    let today = new Date();
    let options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: "2-digit",
        minute: "2-digit",
    };
    return today.toLocaleDateString("en-US", options);
}

module.exports= getDate;


