exports.queryToRegExp = (name) => {
    const txt = name.split(' ');
    let temp;
    if (txt.length == 1) temp = '^' + txt[0];
    else
        txt.forEach((element, index) => {
            if (element.length < 3) {
                return;
            }
            element = '.*' + element + '.*';
            if (index == txt.length - 1) {
                if (temp) temp += element;
                else temp = element;
            } else {
                if (temp) temp += '(?=' + element + ')';
                else temp = '(?=' + element + ')';
            }
        });
    return new RegExp(temp);
};
