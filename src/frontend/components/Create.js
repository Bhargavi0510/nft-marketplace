import { useState } from "react";
import { ethers } from "ethers";
import {Row, Form, Button} from "react-bootstrap"
import {create as ipfsHttpClient} from "ipfs-http-client"
import { Buffer } from "buffer";


const projectId = 'f7a6a72a488e4f71baa9ef438e208298';
const projectSecret = 'k26wqXAaIZK5flNePPXLiQMsYKH34S/4+6BB8M+GqBjjYrd4WJDwUw';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
const client =  ipfsHttpClient({
    host: 'mainnet.infura.io',
    port: 5001,
    protocol: 'https',
    apiPath: '/api/v3',
    headers: {
      authorization: auth
    }
  });

const Create = ({marketplace,nft})=>{
    const [image, setImage] = useState('')
    const [price, setPrice] = useState(null)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    const uploadToIPFS = async (event) =>{
        event.preventDefault()
        const file = event.target.files[0];

        if(typeof file !== 'undefined'){
            try{
                const result = await client.add(file)
                console.log(result)
                setImage(`https://ipfs.infura.io/ipfs/${result.path}`)

            }
            catch (error){
                console.log("ipfs image upload error : ", error)
            }
        }
    }

    const createNFT = async () => {
        if(!image || !price || !name || !description) return
        console.log("hey")

        try {
            const result = await client.add(JSON.stringify({image, name, description}))
            mintThenList(result)

        } catch (error) {
             console.log("ipfs uri upload error : ", error)
        }
    }

    const mintThenList = async (result) => {
        const uri = `https://ipfs.infura.io/ipfs/${result.path}`

        await (await nft.mint(uri)).wait()
        const id = await nft.tokenCount()
        await (await nft.setApprovalForAll(marketplace.address , true)).wait()

        const listingPrice = ethers.utils.parseEther(price.toString())
        await (await marketplace.makeItem(nft.address, id, listingPrice)).wait()

    }
    return(
        <div className="container-fluid mt-5">
            <div className="row">
                <main role="main" className="col-lg-12 mx-auto" style={{maxWidth:'1000px'}}>
                    <div className="content mx-auto">
                        <Row className="g-4">
                            <Form.Control
                                type="file"
                                name="file"
                                onChange={uploadToIPFS}
                            />
                            <Form.Control
                                onChange={(e) => setName(e.target.value)}
                                size="lg"
                                type="text"
                                placeholder="Name"
                            />
                            <Form.Control
                               onChange={(e) => setDescription(e.target.value)}
                               size="lg"
                               type="textarea"
                               placeholder="Description"
                            />
                            <Form.Control
                               onChange={(e) => setPrice(e.target.value)}
                               size="lg"
                               type="number"
                               placeholder="Price in ETH"
                            />
                            <div className="d-grid px-0">
                                <Button onClick={createNFT} variant="primary" size="lg">
                                    Create and List NFT
                                </Button>
                            </div>
                        </Row>
                    </div>
                </main>
            </div>

        </div>
    )

}

export default Create;
