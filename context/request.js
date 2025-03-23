const requestContext = {
    req: null,
    set: function(req) {
        this.req = req;
    },
    get: function() {
        return this.req;
    }
};

export default requestContext;