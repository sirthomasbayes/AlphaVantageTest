import * as React from 'react';
import { TimeSeriesMetadataTable, TimeSeriesDataTable } from './TimeSeriesDisplayComponents'; 
import { ITimeSeriesData, IApiProvider, IMetadata, TimeoutError, ApiError } from './IApiProvider';

interface IProps {
	apiProvider: IApiProvider;
	maxRetry: number;
}

interface IState {
	currentPageNumber: number;
	currentPageItems: Array<ITimeSeriesData>;	
	lastPageNumber: number;
	
	fetchingData: boolean;	// indicates whether we are fetching data from external API
							// if so, used to disable "Fetch Data" button.
	
	statusMessage:string;
	retryAttempt: number;
}

export default class TimeSeriesDisplay extends React.Component<IProps, IState> {	
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
	// state variables relevant to paging 
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

	render() {
		
		return (
			<div key={this.state.currentPageNumber}>
				<button disabled={this.state.fetchingData} onClick={async () => await this.getDataAsync()}>Fetch Data</button>

				<p style={{'color':'red'}}>{this.state.statusMessage}</p>

				{this.renderPageDropdown()}
				
				<TimeSeriesMetadataTable metadata={this.currentMetadata} />
				<br/>
				<TimeSeriesDataTable dataPoints={this.state.currentPageItems} />
			</div>
		);
	}
}