import * as React from "react";

export interface HelloProps { compiler: string; framework: string; }

export class Hello extends React.Component<HelloProps, {}> {
    constructor(props: HelloProps) {
        super(props);
    }

    render() {
        return (
            <div data-testid="hello">
                <h1>Hello from {this.props.compiler} and {this.props.framework}!</h1>
            </div>
        );
    }
}