import React, { useRef } from "react";
import { useState, useEffect } from "react";
import "../styles/TableChart.css"
export default function TableChart(props) {
  const data = props.data?.source;
  const divRef = useRef<HTMLDivElement>(null)
  const dimensions = props.data?.dimensions;

  return (
    <div className="scroll-table" style={{ height: props.height }}>
      <div style={{ display: "inline-flex" }}>
        <div style={divRef.current?.scrollHeight > divRef.current?.clientHeight?{ width: '99%' }:{ width: '100%' }}>
          <table >
            <thead>
              <tr>
                {dimensions?.map(dim => (<th>{props.style?.hasOwnProperty(dim) ? props?.style[dim] : dim}</th>))}
              </tr>
            </thead>
          </table>
        </div>
        {divRef.current?.scrollHeight > divRef.current?.clientHeight && <div style={{ width: '1%', backgroundColor: '#b1b0ae' }}>
        </div>}
      </div>

      <div className="scroll-table-body" style={{ height: props.height }} ref={divRef}>
        <div>
          <table>
            <tbody>
              {data?.map(values => (
                <tr>
                  {dimensions?.map(value => (
                    <td>{values[value]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ width: '100%', height: '34px', backgroundColor: '#b1b0ae' }}>
        </div>
      </div>
    </div>
  )
}
