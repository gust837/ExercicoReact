import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../pages/Home/Home";
import Eventos from "../pages/Home/Eventos/Eventos";
import DetalhesEvento from "../pages/DetalhesEvento/DetalhesEvento";

function AppRoutes(){
    return(
        <Routes>
            <Route path="/home" element={<Home/>} />
            <Route path="/eventos" element={<Eventos/>}/>
            <Route path="/eventos/:id" element={<DetalhesEvento/>}></Route>
            <Route path="*" element={<Navigate to="/home" replace/>}/>
        </Routes>
    )
}

export default AppRoutes;