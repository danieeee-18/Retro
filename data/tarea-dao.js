class TareaDAO {
    #database;
    constructor(database) { this.#database = database; }

    findTareasByUserId(id){
        return this.#database.prepare("SELECT * FROM tareas WHERE id_usuario=?").all(id);
    }

    saveTarea(id_usuario, titulo, descripcion) {
        return this.#database.prepare("INSERT INTO tareas (id_usuario, titulo, descripcion) VALUES (?, ?, ?)")
            .run(id_usuario, titulo, descripcion);
    }
}
module.exports = TareaDAO;