import React, {ReactElement, SetStateAction, useState} from 'react';

const SwitchIconButton = (props:{
    frontIcon: ReactElement,
    backIcon: ReactElement,
    state: boolean,
    setState?: SetStateAction<any>}) => {
    useState()

    return (
        <>
            {props.state?
                props.frontIcon:
                props.backIcon
            }
        </>
    );
};

export default SwitchIconButton;