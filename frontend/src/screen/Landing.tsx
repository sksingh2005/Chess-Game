import { useNavigate } from "react-router-dom"

export const Landing=()=>{
    const navigate=useNavigate();
    return <div>
        <div className="grid grid-cols-1 overflow-hidden md:grid-cols-2 p-10 h-screen bg-slate-900 ">
            <div className="m-5">
                <img src={"/chessboard.jpeg"} className="h-[70%] m-auto" alt="Not found" />
            </div>
            <div className=" m-auto">
                <h1 className="font-semibold text-4xl text-white mb-4">
                    Play Chess Online on the #1 Site!
                </h1>
                <button onClick={()=>{
                    navigate('/game');
                }} type="button" className="focus:outline-none text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:focus:ring-yellow-900">Play Online</button>

            </div>
        </div>
    </div>
}