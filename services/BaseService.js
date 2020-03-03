const mongoose = require("mongoose")
module.exports = class BaseService {
    constructor(model) {
        this._model = model;
        this.create = this.create.bind(this);
        this.readOne = this.readOne.bind(this);
        this.readMany = this.readMany.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async create(user) {
        try {
            let result = await this._model.create(user)
            return result
        } catch (err) {
            throw err
        }
    }


    async readOne(id) {
        try {
            return await this._model.findById({_id: id})
        } catch (err) {
            return err
        }
    }


    async readMany(query = {}) {
        try {
            return await this._model.find(query)

        } catch (err) {
            throw err
        }
    }


    async update(id, changedEntry) {
        try {
            return await this._model.update(
                {_id: mongoose.Types.ObjectId(id)},
                {$set: changedEntry},
                {runValidators: true})
        } catch (err) {
            throw err
        }
    }


    async delete(id) {
        try {
            return await this._model.remove({_id: mongoose.Types.ObjectId(id) });
        } catch (err) {
            throw err
        }
    }
}