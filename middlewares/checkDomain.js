import userModel from "../models/userModel.js"

async function checkDomain(req, res, next) {
    if (req.user) {
        const role = req.user[0].role;
        const host = req.get('host'); // e.g. "videoeditor.vidgo.store"
    
        // Match subdomain with role
        if (host.includes('videoeditor') && role !== 'editor') {
            res.clearCookie('token');
        return res.status(403).json({message: "You are not a Video Editor"})
        }
    
        if (host.includes('admin') && role !== 'admin') {
            res.clearCookie('token');
        return res.status(403).send('You are not an Admin.');
        }

        if(role=='editor' && host !== 'videoeditor.vidgo.store'){
            res.clearCookie('token');
            return res.status(403).send('go to videoeditor subdomain');
        }

        if(role=='admin' && host !== 'admin.vidgo.store'){
            res.clearCookie('token');
            return res.status(403).send('go to admin subdomain');
        }
    
        // if (role === 'client' && host !== 'vidgo.store') {
        //     res.clearCookie('token');
        // return res.status(403).send('You are not a Client.');
        // }
        
        console.log('unknown domain: ', host)
    }
      
    next();
}

export default checkDomain;