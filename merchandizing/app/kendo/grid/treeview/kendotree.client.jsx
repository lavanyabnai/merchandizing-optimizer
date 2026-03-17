import * as React from 'react';
import { TreeView, processTreeViewItems, handleTreeViewCheckChange } from '@progress/kendo-react-treeview';

const tree = [      
  {
  text: 'All Customers',
  items: [{
    text: 'Asia Pacific'
  }, {
    text: 'EMEA'
  }, {
    text: 'North America'
  }]
  },];


export function TreeContainer () {
  const [check, setCheck] = React.useState([]);
  const [expand, setExpand] = React.useState({
    ids: ['Item2'],
    idField: 'text',
  });


  const [select, setSelect] = React.useState(['']);
  const onItemClick = event => {
    setSelect([event.itemHierarchicalIndex]);
  };
  const onExpandChange = event => {
    let ids = expand.ids.slice();
    const index = ids.indexOf(event.item.text);
    index === -1 ? ids.push(event.item.text) : ids.splice(index, 1);
    setExpand({
      ids,
      idField: 'text'
    });
  };
  const onCheckChange = event => {
    const settings = {
      singleMode: false,
      checkChildren: false,
      checkParents: false
    };
    setCheck(handleTreeViewCheckChange(event, check, tree, settings));
  };

  return ( 
  <>
  <div className='font-medium text-gray-900'>
  <TreeView className=''
  data={processTreeViewItems(tree, 
    {select: select,
    check: check,
    expand: expand
  })} 
  expandIcons={true} 
  onExpandChange={onExpandChange} aria-multiselectable={true} onItemClick={onItemClick} checkboxes={true} onCheckChange={onCheckChange} />
  </div>
  </>
  );
}
