import React, {useEffect, useState} from 'react';
import {useRecoilValue} from "recoil";
import {UserID} from "../../../recoil/User";
import {getKnodes} from "../../../service/api/KnodeApi";
import "@antv/graphin/dist/index.css";
import {convertToKtreeG6, KtreeG6} from "../../../service/data/KtreeG6";
import {G6} from "@antv/graphin";

const KnodeGraph = () => {

    const userId = useRecoilValue(UserID)
    const [ktreeG6, setKtreeG6] = useState<KtreeG6>();

    // user -> ktree
    useEffect(() => {
        console.log(`user:${userId} -> ktree`)
        getKnodes(userId)
            .then((data) => {
                setKtreeG6(convertToKtreeG6(data))
            })
    }, [userId])

    useEffect(()=>{
        if(!ktreeG6) return

        let container = document.getElementById("container");
        container = container!


        const graph = new G6.Graph({
            container: "container",
            width: container.scrollWidth,
            height: container.scrollHeight,
            layout: {
                type: 'force',
                preventOverlap: true,
                linkDistance: (d: any) => {
                    if (d.source.id === 'node0') {
                        return 100;
                    }
                    return 30;
                },
                nodeStrength: (d: any) => {
                    if (d.isLeaf) {
                        return -50;
                    }
                    return -10;
                },
                edgeStrength: (d: any) => {
                    if (d.source.id === 'node1' || d.source.id === 'node2' || d.source.id === 'node3') {
                        return 0.7;
                    }
                    return 0.1;
                },
            },
        })

        // @ts-ignore
        graph.data(ktreeG6);
        graph.fitView()
        graph.render();
        console.log()
        return ()=> graph.destroy()
    },[ktreeG6])

    return (
        <>
            <div id={"container"} style={{width: "100vw", height: "80vh"}}></div>
        </>);
};

export default KnodeGraph;