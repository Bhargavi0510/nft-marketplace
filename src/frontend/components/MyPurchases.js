import {useState , useEffect} from 'react'
import {ethers} from 'ethers'
import {Row , Col , Card , Button} from 'react-bootstrap'

export default function MyPurchases({marketplace , nft , account}){

    const [loading, setLoading] = useState(true)
    const [purchases,setPurchases] = useState([])

    const loadPurchaseItems = async() =>{
        const filter = marketplace.filters.Bought(null,null,null,null,null,account)
        const result = await marketplace.queryFilter(filter)
        const purchases = await Promise.all(result.map(async i => {
            i=i.args
            const uri = await nft.tokenURI(i.tokenId)
            const response = await fetch(uri)
            const metadata = await response.json()
            const totalPrice = await marketplace.getTotalPrice(i.itemId)
            let purchasedItem ={
                totalPrice,
                price : i.price,
                itemId : i.itemId,
                name : metadata.name,
                description : metadata.description,
                image : metadata.image
            }

            return purchasedItem
        }))
        setLoading(false)
        setPurchases(purchases)

    }
    useEffect(()=>{
        loadPurchaseItems()
    },[])
    if (loading) return (
        <main style={{padding : "1 rem 0"}}>
            <h2>Loading..</h2>
        </main>
    )

    return (
        <div className='flex justify-center'>
            {purchases.length>0 ? 
                <div className='px-5 py-3 container'>
                    <h2>Listed</h2>
                    <Row xs={1} md={2} lg={4} className='g-4 py-3'>
                        { purchases.map((item, idx)=>(
                            <col key={idx} className='overflow-hidden'>
                                <Card>
                                    <Card.Img variant="top" src={item.image}/>
                                    <Card.Footer>
                                        {ethers.utils.formatEther(item.totalPrice)} ETH
                                    </Card.Footer>
                                </Card>
                            </col>
                        ))
                            
                        }
                    </Row>
                   
                </div>
                : (
                    <main style={{padding : "1 rem 0"}}>
                        <h2>No Purchases.</h2>
                    </main>
                )

            }
        </div>
    )
}