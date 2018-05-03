// ---------HELPERS--------
function add_prefix_to_file(filepath, prefix) {
    l = filepath;
    p = l.split('/');
    x = (p[p.length - 1]).split('.');
    x[0] = x[0] + '_' + prefix;
    p[p.length - 1] = x.join('.');
    p = p.join('/');

    return p;
}

module.exports = {
    add_prefix_to_file: add_prefix_to_file,
};