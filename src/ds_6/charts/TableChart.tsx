import React, { useRef } from "react";
import { useState, useEffect } from "react";
import "../styles/TableChart.css"
export default function TableChart(props) {
  const data = props.data?.source;
  const divRef = useRef<HTMLDivElement>(null)
  const dimensions = props.data?.dimensions;
  const hasHorizontalScrollbar = useRef(divRef.current?.scrollHeight > divRef.current?.clientHeight)
  const headerStyle = useRef({ width: '100%' })
  useEffect(() => {
    if (hasHorizontalScrollbar?.current) {
      headerStyle.current = { width: '99%' }
    }
  }, [])
  return (
    <div className="scroll-table" style={{ height: props.height }}>
      <div style={{ display: "inline-flex" }}>
        <div style={headerStyle.current}>
          <table >
            <thead>
              <tr>
                {dimensions?.map(dim => (<th>{props.style?.hasOwnProperty(dim) ? props?.style[dim] : dim}</th>))}
              </tr>
            </thead>
          </table>
        </div>
        {hasHorizontalScrollbar.current && <div style={{ width: '1%', backgroundColor: '#b1b0ae' }}>
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
        <div className="AbroCadabra" style={{ width: '100%', height: '34px', backgroundColor: '#b1b0ae' }}>
        </div>
      </div>
    </div>
  )
}
