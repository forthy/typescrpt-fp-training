import React from "react";
import renderer from 'react-test-renderer';
import { Hello } from "../components/Hello";

describe("Hello testing", () => {
    test("test01", () => {
        const component = renderer.create(<Hello compiler="mycompiler" framework="myframework" />);
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    })
})