import * as React from 'react';
import { IMetadata } from './iApiProvider'

interface IProps {
	metadata: IMetadata;
}

let TimeSeriesMetadataTable = ({ metadata }) => {
	let metadataKeys = [];

	for (let key in metadata) metadataKeys.push(key);

	return (
		<table>
			<thead>
				<tr>
					{ metadataKeys.map((elem,index) => <th key={`metadata_header_${index}`}>{elem}</th>) }
				</tr>
			</thead>
			<tbody>
				<tr>
					{ metadataKeys.map((elem,index) => <td key={`metadata_value_${index}`}>{metadata[elem].toString()}</td>) }
				</tr>
			</tbody>
		</table>
	);	
};

export default TimeSeriesMetadataTable;