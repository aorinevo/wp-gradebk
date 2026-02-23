interface ReadOnlyCellProps {
	value: number;
}

export default function ReadOnlyCell( { value }: ReadOnlyCellProps ) {
	return <td className="an-gb-cell an-gb-cell-readonly">{ value }</td>;
}
