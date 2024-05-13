import { Elysia, t } from "elysia";
import { cors } from '@elysiajs/cors'
import prisma from "../lib/prisma";

const app = new Elysia()

app.get('/', async (req) => {
  console.log(req.path)
  const usuario = await prisma.user.findMany()
  return Response.json({message: 'ok', usuario}, {status: 200})
})

app.get('/:id', async ({params, request},)=>{
  const filtro = await prisma.user.findFirst({
    where:{
      id: params.id
    }
  })

  if(!filtro){
    return Response.json({message: 'Usuario não encontrado!'}, {status: 400})
  }

  return Response.json({usuario: filtro}, {status: 201})
  // return Response.json({id: params.id})
})

app.post('/', async (req) => {
  const { name, email, password } = req.body

  if(!name || !email || !password){
    return Response.json({err: 'Dados não encontrados'}, {status: 400})
  }
  const usuarios = await prisma.user.create({
    data: {
      username: name,
      email,
      password
    }
  })

  if(usuarios){
    return Response.json({usuarios}, {status: 200})
  }

},{
  body: t.Object({
    name: t.String(),
    email: t.String(),
    password: t.String()
  }),
  error: () => {
    return Response.json({message: 'Os dados enviados não seguem o padrão da tipagem'})
  }
})

app.post('/login', async (req)=>{
  const { email, password } = req.body

  if(!email || !password){
    return Response.json({message: 'Campos não preenchidos'}, {status: 400})
  }

  const usuarios = await prisma.user.findFirst({
    where: {
      email,
      password
    }
  })

  if(usuarios){
    
    const token = await prisma.token.create({
      data:{
        userId: usuarios.id
      }
    })
    
    if(!token){
      return Response.json({message: 'Erro ao gerar token'}, {status: 400})
    }else{
      // return Response.json({message: 'Token gerado com sucesso!'})
      console.log({message: 'Token gerado com sucesso!'})
      return Response.json({message: 'Usuario logado com sucesso!'}, {status: 200})
    }
    
  }


  return Response.json({message: 'erro em alguma parte aqui pra cima, boa sorte'},{status: 400})
},{
  body: t.Object({
    email: t.String(),
    password: t.String()
  }),
  error: () => {
    return Response.json({message: 'Os dados do usuario enviado, não seguem o padrão da tipagem'})
  }
})

app.delete('/logout/:id', async ({params, request})=>{
  if(!params.id){
    return Response.json({message: 'Id não informado'}, {status: 400})
  }
  try{
    await prisma.token.deleteMany({
      where: {
        userId: params.id
      }
    })

    return Response.json({message: 'Usuario deslogado com sucesso'})
  }catch(err){
    return Response.json({message:err}, {status: 400})
  }
})

app.post('/posts/:id', async ({params, body})=>{
  const {title, description} = body
  if(!title || !description){
    return Response.json({message: 'Campos não preenchidos'}, {status: 400})
  }

  try{
    const post = await prisma.postagem.create({
      data:{
        title,
        description,
        created: new Date(),
        authorId: params.id
      }
    })
    if(post){
      return Response.json({message: 'Postagem criada com sucesso!'}, {status: 200})
    }
  }catch(err){
    return Response.json({message: err}, {status: 400})
  }
}, {
  body: t.Object({
    title: t.String(),
    description: t.String(),
  })
})

app.put('/posts/:id/:postId', async ({params, body})=>{
  const {title, description} = body
  if(!title || !description){
    return Response.json({message: 'Campos não preenchidos'}, {status: 400})
  }

  try{
    const postAtt = await prisma.postagem.updateMany({
      where:{
        id: params.postId,
        authorId: params.id as string
      },
      data:{
        title,
        description
      }
    })
    if(postAtt){
      return Response.json({message: 'Postagem atualizada com sucesso!'}, {status: 200})
    }
  }catch(err){
    return Response.json({message: err}, {status: 400})
  }
},
{
  body: t.Object({
    title: t.String(),
    description: t.String()
  })
})

app.get('/posts', async ()=>{
  try{
    const posts = await prisma.postagem.findMany({
      orderBy:{
        created: 'asc'
      }
    })
    if(posts){
      return Response.json({posts}, {status: 200})
    }
    }catch(err){
      return Response.json({message: err}, {status: 400})
    }
  

  return Response.json({message: 'Deu erro aqui'}, {status: 400})
})

app.use(cors({methods: ["GET", "POST", "DELETE", "PUT"], origin: /.*\.saltyaom\.com$/,})).listen({port: 3333})

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
