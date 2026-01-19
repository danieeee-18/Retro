class UsuarioDAO {
    #database;
    constructor(database) { this.#database = database; }

    findUserByEmail(email){
        return this.#database.prepare("SELECT * FROM usuarios WHERE email = ?").get(email);
    }
}
module.exports = UsuarioDAO;