import * as React from 'react';
import { ITimeSeriesData, IApiProvider, IMetadata, TimeoutError, ApiError } from './IApiProvider';

interface IProps {
	apiProvider: IApiProvider;
	maxRetry: number;
}

interface IState {
	currentPageNumber: number;	
	lastPageNumber: number;
	currentPageItems: Array<ITimeSeriesData>;
	
	fetchingData: boolean;	// indicates whether we are fetching data from external API
							// if so, used to disable 
	
	statusMessage:string;
	retryAttempt: number;
}

export default class TimeSeriesTable extends React.Component<IProps, IState> {	
	private currentItems : Array<ITimeSeriesData>;
	private currentMetadata: IMetadata;
	private pageSize = 10;

	constructor(props: any) {
		super(props);
		this.state = {
			currentPageNumber: 0,
			currentPageItems: [],
			lastPageNumber: 0,

			fetchingData: false,

			statusMessage: '',
			retryAttempt: 0
		};
	}

	// modifies internal state of TimeSeriesTable
	// fetches elements from API and 
	private async getDataAsync() {
		let apiProvider = this.props.apiProvider;
		this.setState({ fetchingData: true });

		try {  
			let items = await apiProvider.getDataAsync(); 
			this.currentItems = items.timeSeriesData;
			this.currentMetadata = items.metadata;

			this.displayPage(1);
		}
		catch (e) {  
			if (e instanceof TimeoutError) {
				let retryAttempt = this.state.retryAttempt + 1,
					maxRetriesReached = retryAttempt > this.props.maxRetry,
					statusMessage = !maxRetriesReached ?
						`Request for time series data has timed out. Retry attempt ${retryAttempt}.` :
						`External server is unavailable. Please try again later.`;

				this.setState({ 
					statusMessage: statusMessage,
					retryAttempt: maxRetriesReached ? retryAttempt + 1 : 0
				});

				if (!maxRetriesReached) await this.getDataAsync();
			}

			if (e instanceof ApiError) {
				this.setState({ statusMessage: `An error occurred while requesting time series data: ${e.message}` });
			}
		}

		this.setState({ fetchingData: false });
	}

	// displays items on page pageNumber by setting
	// state variables related to paging 
	private displayPage(pageNumber:number) {
		let listSize = this.currentItems.length,
			pageSize = this.pageSize,
			skip = pageSize * (pageNumber - 1);

		this.setState({ 
			currentPageNumber: pageNumber,
			lastPageNumber: listSize / pageSize + (listSize % pageSize > 0 ? 1 : 0),
			currentPageItems: this.currentItems.slice(skip, skip + pageSize),
			statusMessage: "",
			retryAttempt: 0
		});
	}

	private renderMetadata() {
		if (!this.currentMetadata) return;

		let metadataKeys = [];

		for (let key in this.currentMetadata) metadataKeys.push(key);

		return (
			<table>
				<thead>
					<tr>
						{ metadataKeys.map((elem,index) => <th key={`metadata_header_${index}`}>{elem}</th>) }
					</tr>
				</thead>
				<tbody>
					<tr>
						{ metadataKeys.map((elem,index) => <td key={`metadata_value_${index}`}>{this.currentMetadata[elem].toString()}</td>) }
					</tr>
				</tbody>
			</table>
		);	
	}

	private renderPageDropdown() {
		if (!this.currentItems) return;

		let numPages = this.state.lastPageNumber,
			range = [];
		for (let i = 1; i <= numPages; i++) range.push(<option key={`page_option_${i}`} value={i}>{i}</option>);

		return (
			<select 
         		value={this.state.currentPageNumber.toString()}
         		onChange={(e) => this.displayPage(Number(e.target.value))} >
         		{ range }
         	</select>);
	}

	private renderTable() {
		if (!this.currentItems) return;

		let timeSeriesKeys = [
			'datetime', 'open', 'high', 'low', 'volume'
		],
			currentPageItems = this.state.currentPageItems;

		return (
			<table>
				<thead>
					<tr>
						{ timeSeriesKeys.map((elem, index) => <th key={`timeseries_header_${index}`}>{elem}</th>) }
					</tr>
				</thead>

				<tbody>
				{ currentPageItems.map((elem, index) => 
					<tr key={`timeseries_data_${index}`}>
						{ timeSeriesKeys.map((innerElem, innerIndex) => <td key={`timeseries_data_${index}_value_${innerIndex}`}>{ elem[innerElem].toString() }</td>) }
					</tr>) }
				</tbody>
			</table>
		);
	}

	render() {
		return (
			<div>
				<button disabled={this.state.fetchingData} onClick={async () => await this.getDataAsync()}>Fetch Data</button>

				<p style={{'color':'red'}}>{this.state.statusMessage}</p>

				{this.renderPageDropdown()}
				{this.renderMetadata()}
				{this.renderTable()}
			</div>
		);
	}
}