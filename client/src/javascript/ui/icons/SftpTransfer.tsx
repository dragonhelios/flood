import classNames from 'classnames';
import {FC, memo} from 'react';

interface SftpTransferProps {
  className?: string;
}

const SftpTransfer: FC<SftpTransferProps> = memo(({className}: SftpTransferProps) => (
  <svg viewBox="0 0 60 50" className={classNames('icon', className)} style={{overflow: 'visible'}}>
    <defs>
      <marker id="marker14299" style={{overflow: 'visible'}} orient="auto">
        <path
          transform="scale(.2)"
          d="m5.77 0-8.65 5v-10z"
          style={{fillRule: 'evenodd', fill: 'context-stroke', strokeWidth: '1pt', stroke: 'context-stroke'}}
        />
      </marker>
      <marker id="TriangleOutS" style={{overflow: 'visible'}} orient="auto">
        <path
          transform="scale(.2)"
          d="m5.77 0-8.65 5v-10z"
          style={{fillRule: 'evenodd', fill: 'context-stroke', strokeWidth: '1pt', stroke: 'context-stroke'}}
        />
      </marker>
    </defs>
    <g transform="translate(-13.574 -35.914)">
      <g transform="matrix(1.3943 0 0 1.3929 -5.7462 -14.504)">
        <path
          d="m51.684 38.465a13.978 10.673 0 0 0-9.4755 2.8349 9.9978 7.812 0 0 0-5.7815-1.4392 9.9978 7.812 0 0 0-9.9981 7.8122 9.9978 7.812 0 0 0 0.0079 0.16736 12.331 9.5841 0 0 0-10.413 9.4634 12.331 9.5841 0 0 0 10.73 9.4997 12.276 10.2 0 0 0 9.539 3.7907 12.276 10.2 0 0 0 4.4438-0.69603 19.374 11.15 0 0 0 10.355 1.7322 19.374 11.15 0 0 0 19.374-11.15 19.374 11.15 0 0 0-5.5888-7.8339 13.978 10.673 0 0 0 0.78545-3.5085 13.978 10.673 0 0 0-13.979-10.672z"
          style={{
            fill: 'none',
            paintOrder: 'normal',
            strokeLinejoin: 'round',
            strokeWidth: '6.5714',
            stroke: '#737373',
          }}
        />
        <path
          d="m53.742 47.532c5.0494 6.7356 3.1962 12.692 0.3286 15.997"
          style={{
            fill: 'none',
            markerEnd: 'url(#TriangleOutS)',
            paintOrder: 'normal',
            strokeLinejoin: 'round',
            strokeWidth: '5.5714',
            stroke: '#737373',
          }}
        />
        <path
          d="m36.599 64.967c-5.0494-6.7356-3.8918-12.372-1.0242-15.678"
          style={{
            fill: 'none',
            markerEnd: 'url(#marker14299)',
            paintOrder: 'normal',
            strokeLinejoin: 'round',
            strokeWidth: '5.5714',
            stroke: '#737373',
          }}
        />
      </g>
    </g>
  </svg>
));

SftpTransfer.defaultProps = {
  className: undefined,
};

export default SftpTransfer;
