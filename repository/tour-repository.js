exports.tourQuery = query => {

    if (query === null) return {};

    delete query.page;
    delete query.size;

    query = JSON.stringify(this.cleanData(query)); //for exception handling ('' or null) input

    query = query.replace(/\b(gt|gte|lt|lte|eq|leq)\b/g, match => `$${match}`);

    query = JSON.parse(query);

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