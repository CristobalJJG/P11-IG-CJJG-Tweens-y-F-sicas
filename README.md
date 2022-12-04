Para el desarrollo de la primera parte de la práctica, basé 
las imágenes de la IA [Dall-e](https://labs.openai.com/) para mostrarlas haciendo uso de 
tweens, de forma que se fuesen mostrando 1 a 1 y se colocaran
 en un espacio en concreto sobre la escena.

Para el desarrollo de la segunda parte de la práctica y haciendo referencia a algunos ejemplos vistos en la clase 
práctica. 
* Lo primero que pensé fué en hacer que los bloques se rompieran al contacto con la bola, como se comprueba en 
[ConvexObjectBreaker](https://sbcode.net/threejs/convexobjectbreaker/). **No** funcionó, ya que me daban muchos errores de las librerías que se usaban en el ejemplo. en concreto: 

![imagen de error con ConvexObjectBraker](./Errores/error_ConvexObjectBreaker.png)

* Desistí, aunque dejé el código para que se viera mi       intención.
* A continuación, y recordando la sábana de ejemplo y algún 
  que otro git, decidí hacer que la bola fuese un objeto soft en 
  vez de rigid, y que al colisionar con los bloques, quedara a modo cómico que la bola se distorsionara como si fuera un 
  globo.
* (Spoiler) La librería "BufferGeometryUtils" tampoco me funcionó, por lo que tuve que seguir buscando algo que hacer para ver si funcionaba.
