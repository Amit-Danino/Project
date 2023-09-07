const db = require('../database/db'); //improt db connectoin

const getFeatureData = async(req, res) => {
    try {
        const features = await db.promise().query(
            'SELECT * FROM features'
        );
        res.status(200).json(features[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const modify = async(req, res) => {
    try {
        const { feature, info } = req.body
        console.log(feature)
        console.log(info)
        await db.promise().query(
            'UPDATE features SET feature_status = ? WHERE feature_name = ?', [info, feature]
        );
        // const features = {}
        res.status(200).json({ message: "successful update" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    modify,
    getFeatureData
};