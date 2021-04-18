exports.userQuery = query => {

    if (query === null) return {};

    delete query.page;
    delete query.size;

    // query = this.cleanData(query); for exception handling ('' or null) input

    for (let q in query) {
        if (q === "name") {
            query[q] = {$regex: `.*${query[q]}.*`, $options: 'i'} // in this query without name everything should be exact value
        }
    }
    return query;
}

exports.cleanData = data => {
    for(let d in data){
        if(data[d] === '' || data[d] == null){
            delete data[d];
        }
    }
    return data;
}