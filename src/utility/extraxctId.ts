import type { Request } from "express";

export const extractId = (req:Request)=>{
    const splitUrl = req.url.split("/")
    return splitUrl[1]
}